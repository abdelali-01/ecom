const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Helper function to normalize path
const normalizePath = (filePath) => {
    if (typeof filePath !== "string") return "";
    return filePath.replace(/\\/g, "/");
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Get comprehensive statistics
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    console.log("Calculating statistics for:", { currentMonth, currentYear });

    // 1. Monthly Income (completed orders only) - Simplified query
    const [monthlyIncomeResult] = await pool.query(
      `
            SELECT 
                COALESCE(SUM(
                    CASE 
                        WHEN o.is_pack = 0 THEN 
                            (SELECT COALESCE(SUM(op.quantity * p.price), 0)
                             FROM order_products op
                             JOIN products p ON op.product_id = p.id
                             WHERE op.order_id = o.id)
                        WHEN o.is_pack = 1 THEN 
                            (SELECT COALESCE(SUM(opp.quantity * p.price), 0)
                             FROM order_pack_products opp
                             JOIN products p ON opp.product_id = p.id
                             WHERE opp.order_id = o.id)
                        ELSE 0
                    END
                ), 0) as total_income
            FROM orders o
            WHERE o.order_status = 'completed'
            AND MONTH(o.created_at) = ?
            AND YEAR(o.created_at) = ?
        `,
      [currentMonth, currentYear]
    );

    const monthly_income = monthlyIncomeResult[0].total_income || 0;
    console.log("Monthly income result:", monthly_income);

    // 2. Monthly Orders Count
    const [monthlyOrdersResult] = await pool.query(
      `
            SELECT COUNT(*) as total_orders
            FROM orders
            WHERE MONTH(created_at) = ?
            AND YEAR(created_at) = ?
        `,
      [currentMonth, currentYear]
    );

    const monthly_orders = monthlyOrdersResult[0].total_orders || 0;
    console.log("Monthly orders result:", monthly_orders);

    // Debug: Check if there are any orders at all
    const [allOrdersResult] = await pool.query(`
            SELECT COUNT(*) as total_all_orders FROM orders
        `);
    console.log(
      "Total orders in database:",
      allOrdersResult[0].total_all_orders
    );

    // Debug: Check completed orders
    const [completedOrdersResult] = await pool.query(`
            SELECT COUNT(*) as completed_orders 
            FROM orders 
            WHERE order_status = 'completed'
        `);
    console.log(
      "Completed orders in database:",
      completedOrdersResult[0].completed_orders
    );

    // Debug: Check orders for current month
    const [currentMonthOrdersResult] = await pool.query(
      `
            SELECT COUNT(*) as current_month_orders
            FROM orders
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        `,
      [currentMonth, currentYear]
    );
    console.log(
      "Current month orders:",
      currentMonthOrdersResult[0].current_month_orders
    );

    // 3. Popular Products (top 5 selling products) - Simplified
    const [popularProductsResult] = await pool.query(
      `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.images,
                COALESCE(SUM(
                    CASE 
                        WHEN o.is_pack = 0 THEN op.quantity
                        WHEN o.is_pack = 1 THEN opp.quantity
                        ELSE 0
                    END
                ), 0) as total_sold
            FROM products p
            LEFT JOIN order_products op ON p.id = op.product_id
            LEFT JOIN order_pack_products opp ON p.id = opp.product_id
            LEFT JOIN orders o ON (op.order_id = o.id OR opp.order_id = o.id)
            WHERE (o.order_status = 'completed' OR o.order_status IS NULL)
            AND (MONTH(o.created_at) = ? OR o.created_at IS NULL)
            AND (YEAR(o.created_at) = ? OR o.created_at IS NULL)
            GROUP BY p.id, p.name, p.price, p.images
            ORDER BY total_sold DESC
            LIMIT 5
        `,
      [currentMonth, currentYear]
    );

    const popular_products = popularProductsResult.map((product) => {
      // Normalize image paths
      let images = [];

      if (product.images) {
        try {
          const parsed = JSON.parse(product.images);
          images = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // fallback: maybe product.images was already parsed, or malformed
          images = typeof product.images === 'string' ? [product.images] : [];
        }
      }

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: images,
        total_sold: product.total_sold,
      };
    });

    // 4. Monthly Sales Chart Data - Array of 12 months income for current year
    const [yearlyIncomeResult] = await pool.query(
      `
            SELECT 
                MONTH(o.created_at) as month_number,
                COALESCE(SUM(
                    CASE 
                        WHEN o.is_pack = 0 THEN 
                            (SELECT COALESCE(SUM(op.quantity * p.price), 0)
                             FROM order_products op
                             JOIN products p ON op.product_id = p.id
                             WHERE op.order_id = o.id)
                        WHEN o.is_pack = 1 THEN 
                            (SELECT COALESCE(SUM(opp.quantity * p.price), 0)
                             FROM order_pack_products opp
                             JOIN products p ON opp.product_id = p.id
                             WHERE opp.order_id = o.id)
                        ELSE 0
                    END
                ), 0) as total_revenue
            FROM orders o
            WHERE o.order_status = 'completed'
            AND YEAR(o.created_at) = ?
            GROUP BY MONTH(o.created_at)
            ORDER BY month_number ASC
        `,
      [currentYear]
    );

    // Create array of 12 months with income values
    const monthly_income_array = new Array(12).fill(0);

    // Fill in the actual income values for months that have data
    yearlyIncomeResult.forEach((item) => {
      const monthIndex = item.month_number - 1; // Convert to 0-based index
      monthly_income_array[monthIndex] = item.total_revenue;
    });

    const monthly_sales_chart = monthly_income_array;

    // 5. Additional Statistics
    const [totalProductsResult] = await pool.query(`
            SELECT COUNT(*) as total_products FROM products
        `);

    const [totalCategoriesResult] = await pool.query(`
            SELECT COUNT(*) as total_categories FROM categories
        `);

    const [pendingOrdersResult] = await pool.query(`
            SELECT COUNT(*) as pending_orders 
            FROM orders 
            WHERE order_status = 'pending'
        `);

    const [totalOrdersResult] = await pool.query(`
            SELECT COUNT(*) as total_orders FROM orders
        `);

    // 6. Order Status Distribution
    const [orderStatusResult] = await pool.query(`
            SELECT 
                order_status,
                COUNT(*) as count
            FROM orders
            GROUP BY order_status
        `);

    const order_status_distribution = orderStatusResult.reduce((acc, item) => {
      acc[item.order_status] = item.count;
      return acc;
    }, {});

    // 7. Recent Orders (last 5)
    const [recentOrdersResult] = await pool.query(`
            SELECT 
                id,
                name,
                phone,
                order_status,
                created_at,
                is_pack
            FROM orders
            ORDER BY created_at DESC
            LIMIT 5
        `);

    const recent_orders = recentOrdersResult.map((order) => ({
      id: order.id,
      name: order.name,
      phone: order.phone,
      status: order.order_status,
      date: order.created_at,
      is_pack: order.is_pack,
    }));

    // Compile all statistics
    const statistics = {
      monthly_income,
      monthly_orders,
      popular_products,
      monthly_sales_chart,
      total_products: totalProductsResult[0].total_products,
      total_categories: totalCategoriesResult[0].total_categories,
      pending_orders: pendingOrdersResult[0].pending_orders,
      total_orders: totalOrdersResult[0].total_orders,
      order_status_distribution,
      recent_orders,
    };

    console.log("Final statistics:", statistics);
    res.json(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
});

// Test route to debug orders
router.get("/debug", isAuthenticated, async (req, res) => {
  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    console.log("Debug - Current month/year:", { currentMonth, currentYear });

    // Check all orders
    const [allOrders] = await pool.query("SELECT * FROM orders LIMIT 5");
    console.log("Debug - Sample orders:", allOrders);

    // Check order statuses
    const [orderStatuses] = await pool.query(`
            SELECT order_status, COUNT(*) as count 
            FROM orders 
            GROUP BY order_status
        `);
    console.log("Debug - Order statuses:", orderStatuses);

    // Check orders for current month
    const [currentMonthOrders] = await pool.query(
      `
            SELECT * FROM orders 
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        `,
      [currentMonth, currentYear]
    );
    console.log("Debug - Current month orders:", currentMonthOrders);

    // Check completed orders
    const [completedOrders] = await pool.query(`
            SELECT * FROM orders 
            WHERE order_status = 'completed'
            LIMIT 5
        `);
    console.log("Debug - Completed orders:", completedOrders);

    // Check order_products
    const [orderProducts] = await pool.query(`
            SELECT op.*, p.price, p.name 
            FROM order_products op 
            JOIN products p ON op.product_id = p.id 
            LIMIT 5
        `);
    console.log("Debug - Order products:", orderProducts);

    res.json({
      currentMonth,
      currentYear,
      allOrders: allOrders.length,
      orderStatuses,
      currentMonthOrders: currentMonthOrders.length,
      completedOrders: completedOrders.length,
      orderProducts: orderProducts.length,
      sampleOrders: allOrders,
      sampleCompletedOrders: completedOrders,
      sampleOrderProducts: orderProducts,
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

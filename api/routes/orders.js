const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get all orders
router.get("/", async (req, res) => {
  try {
    // Fetch orders
    const [orders] = await pool.query(`
            SELECT * FROM orders ORDER BY created_at DESC
        `);

    // Fetch products for all orders
    const [orderProducts] = await pool.query(`
            SELECT op.*, p.name as product_name, p.price as product_price, p.images as product_images
            FROM order_products op
            JOIN products p ON op.product_id = p.id
        `);

    // Group products by order_id
    const productsByOrder = {};
    const productIds = [...new Set(orderProducts.map((op) => op.product_id))];
    let productAttrsById = {};

    if (productIds.length > 0) {
      // Fetch all variants for these products
      const [variants] = await pool.query(
        `SELECT product_id, attributes, stock FROM variants WHERE product_id IN (${productIds
          .map(() => "?")
          .join(",")})`,
        productIds
      );
      // Aggregate attributes for each product
      productAttrsById = productIds.reduce((acc, pid) => {
        const variantsForProduct = variants.filter((v) => v.product_id == pid);
        const attrAgg = {};
        variantsForProduct.forEach((variant) => {
          const attrs = variant.attributes
            ? JSON.parse(variant.attributes)
            : {};
          Object.entries(attrs).forEach(([attrName, attrValue]) => {
            if (!attrAgg[attrName]) attrAgg[attrName] = {};
            if (!attrAgg[attrName][attrValue]) attrAgg[attrName][attrValue] = 0;
            attrAgg[attrName][attrValue] += variant.stock;
          });
        });
        acc[pid] = attrAgg;
        return acc;
      }, {});
    }

    // Attach products to each order
    const result = [];
    for (const order of orders) {
      if (order.is_pack) {
        // Fetch packs for this order
        const [orderPacks] = await pool.query(
          `SELECT op.*, p.name as pack_name, p.images as pack_images, p.price as pack_price, p.discount as pack_discount, p.description as pack_description
           FROM order_packs op
           JOIN packs p ON op.pack_id = p.id
           WHERE op.order_id = ?`,
          [order.id]
        );
        let allPackProducts = [];
        let packObj = null;
        for (const pack of orderPacks) {
          const [packProducts] = await pool.query(
            `SELECT opp.*, pr.name as product_name, pr.price as product_price, pr.images as product_images
             FROM order_pack_products opp
             JOIN products pr ON opp.product_id = pr.id
             WHERE opp.order_id = ? AND opp.pack_id = ?`,
            [order.id, pack.pack_id]
          );
          // Attach products to the pack, and flatten for products array
          const products = packProducts.map(prod => ({
            productId: prod.product_id,
            quantity: prod.quantity,
            attributes: prod.attributes ? JSON.parse(prod.attributes) : {},
            name: prod.product_name,
            price: prod.product_price,
            image: prod.product_images ? JSON.parse(prod.product_images)[0] : null,
            packId: pack.pack_id,
          }));
          allPackProducts = allPackProducts.concat(products);
          // Build pack object (if only one pack per order)
          packObj = {
            id: pack.pack_id,
            name: pack.pack_name,
            image: pack.pack_images ? JSON.parse(pack.pack_images)[0] : null,
            price: pack.pack_price,
            discount: pack.pack_discount,
            description: pack.pack_description,
            quantity: pack.quantity,
            products: products,
          };
        }
        // Calculate subtotal
        const subtotal = allPackProducts.reduce((sum, prod) => sum + prod.price * (prod.quantity || 1), 0);
        // Fetch shipping price from wilayas table if possible
        let shipping = 0;
        try {
          if (order.wilaya && order.delivery_type) {
            const [wilayaRows] = await pool.query(
              "SELECT shipping_prices FROM wilayas WHERE name = ?",
              [order.wilaya]
            );
            if (wilayaRows.length > 0) {
              const shippingPrices = JSON.parse(wilayaRows[0].shipping_prices);
              shipping = shippingPrices[order.delivery_type] || 0;
            }
          }
        } catch (err) {
          shipping = 0;
        }
        let discount = 0;
        if (order.discount_value && !isNaN(Number(order.discount_value))) {
          discount = Number(order.discount_value);
        }
        // For all products in all packs, fetch and attach product_attr
        const allProductIds = Array.from(new Set(allPackProducts.map(p => p.productId)));
        let productAttrsById = {};
        if (allProductIds.length > 0) {
          const [variants] = await pool.query(
            `SELECT product_id, attributes, stock FROM variants WHERE product_id IN (${allProductIds.map(() => '?').join(',')})`,
            allProductIds
          );
          productAttrsById = allProductIds.reduce((acc, pid) => {
            const variantsForProduct = variants.filter(v => v.product_id == pid);
            const attrAgg = {};
            variantsForProduct.forEach(variant => {
              const attrs = variant.attributes ? JSON.parse(variant.attributes) : {};
              Object.entries(attrs).forEach(([attrName, attrValue]) => {
                if (!attrAgg[attrName]) attrAgg[attrName] = {};
                if (!attrAgg[attrName][attrValue]) attrAgg[attrName][attrValue] = 0;
                attrAgg[attrName][attrValue] += variant.stock;
              });
            });
            acc[pid] = attrAgg;
            return acc;
          }, {});
        }
        // Now, re-map allPackProducts to include product_attr
        allPackProducts = allPackProducts.map(p => ({
          ...p,
          product_attr: productAttrsById[p.productId] || {},
        }));
        result.push({
          ...order,
          promoCode: order.promo_code,
          discountValue: order.discount_value,
          products: allPackProducts,
          pack: packObj,
          total: subtotal + shipping - discount,
        });
      } else {
        // ... existing logic for normal orders ...
        result.push({
          ...order,
          promoCode: order.promo_code,
          discountValue: order.discount_value,
          products: orderProducts
            .filter((op) => op.order_id == order.id)
            .map((op) => ({
              productId: op.product_id,
              quantity: op.quantity,
              attributes: op.attributes ? JSON.parse(op.attributes) : {},
              product_attr: productAttrsById[op.product_id] || {},
              name: op.product_name,
              price: op.product_price,
              image: op.product_images ? JSON.parse(op.product_images)[0] : null,
            })),
        });
      }
    }

    // After building the result array, calculate the total for each order
    for (const order of result) {
      // Calculate subtotal
      const subtotal = order.products.reduce(
        (sum, prod) => sum + prod.price * (prod.quantity || 1),
        0
      );
      // Fetch shipping price from wilayas table if possible
      let shipping = 0;
      try {
        if (order.wilaya && order.delivery_type) {
          const [wilayaRows] = await pool.query(
            "SELECT shipping_prices FROM wilayas WHERE name = ?",
            [order.wilaya]
          );
          if (wilayaRows.length > 0) {
            const shippingPrices = JSON.parse(wilayaRows[0].shipping_prices);
            shipping = shippingPrices[order.delivery_type] || 0;
          }
        }
      } catch (err) {
        shipping = 0;
      }
      // Remove discount_value from total if it exists
      let discount = 0;
      if (order.discount_value && !isNaN(Number(order.discount_value))) {
        discount = Number(order.discount_value);
      }
      order.total = subtotal + shipping - discount;
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post("/", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      phone,
      wilaya,
      city,
      address,
      remarks,
      delivery_type,
      promoCode,
      discountValue,
      products,
      isPack,
    } = req.body;

    const [result] = await connection.query(
      `INSERT INTO orders (name, phone, wilaya, city, address, remarks, delivery_type, promo_code, discount_value, is_pack) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, wilaya, city, address, remarks, delivery_type, promoCode || null, discountValue, isPack ? 1 : 0]
    );
    const orderId = result.insertId;

    if (isPack) {
      for (const pack of products) {
        await connection.query(
          `INSERT INTO order_packs (order_id, pack_id, quantity) VALUES (?, ?, ?)`,
          [orderId, pack.packId, pack.quantity || 1]
        );
        if (Array.isArray(pack.products)) {
          for (const prod of pack.products) {
            await connection.query(
              `INSERT INTO order_pack_products (order_id, pack_id, product_id, quantity, attributes) VALUES (?, ?, ?, ?, ?)`,
              [orderId, pack.packId, prod.productId, prod.quantity || 1, JSON.stringify(prod.attributes || {})]
            );
            const qtyToDecrease = (pack.quantity || 1) * (prod.quantity || 1);
            if (prod.attributes && Object.keys(prod.attributes).length > 0) {
              await connection.query(
                'UPDATE variants SET stock = stock - ? WHERE product_id = ? AND attributes = ?',
                [qtyToDecrease, prod.productId, JSON.stringify(prod.attributes)]
              );
            } else {
              await connection.query(
                'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                [qtyToDecrease, prod.productId]
              );
            }
          }
        }
      }
    } else if (Array.isArray(products)) {
      for (const prod of products) {
        await connection.query(
          `INSERT INTO order_products (order_id, product_id, quantity, attributes) VALUES (?, ?, ?, ?)`,
          [orderId, prod.productId, prod.quantity, JSON.stringify(prod.attributes || {})]
        );
        if (prod.attributes && Object.keys(prod.attributes).length > 0) {
          await connection.query(
            'UPDATE variants SET stock = stock - ? WHERE product_id = ? AND attributes = ?',
            [prod.quantity, prod.productId, JSON.stringify(prod.attributes)]
          );
        } else {
          await connection.query(
            'UPDATE products SET quantity = quantity - ? WHERE id = ?',
            [prod.quantity, prod.productId]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({ id: orderId, message: "Order created successfully" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Update order
router.patch("/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const orderId = req.params.id;
    const updates = req.body;
    const { products, packs, order_status, ...orderFields } = updates;

    const [currentOrderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (currentOrderRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Order not found' });
    }
    const currentOrder = currentOrderRows[0];

    if (updates.order_status === 'canceled' && currentOrder.order_status !== 'canceled') {
        if (currentOrder.is_pack) {
            const [orderPacks] = await connection.query('SELECT * FROM order_packs WHERE order_id = ?', [orderId]);
            for (const pack of orderPacks) {
                const [packProducts] = await connection.query('SELECT * FROM order_pack_products WHERE order_id = ? AND pack_id = ?', [orderId, pack.pack_id]);
                for (const prod of packProducts) {
                    const qtyToIncrease = (pack.quantity || 1) * (prod.quantity || 1);
                    const attributes = prod.attributes ? JSON.parse(prod.attributes) : {};
                    if (Object.keys(attributes).length > 0) {
                        await connection.query('UPDATE variants SET stock = stock + ? WHERE product_id = ? AND attributes = ?', [qtyToIncrease, prod.product_id, JSON.stringify(attributes)]);
                    } else {
                        await connection.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [qtyToIncrease, prod.product_id]);
                    }
                }
            }
        } else {
            const [orderProducts] = await connection.query('SELECT * FROM order_products WHERE order_id = ?', [orderId]);
            for (const prod of orderProducts) {
                const attributes = prod.attributes ? JSON.parse(prod.attributes) : {};
                if (Object.keys(attributes).length > 0) {
                    await connection.query('UPDATE variants SET stock = stock + ? WHERE product_id = ? AND attributes = ?', [prod.quantity, prod.product_id, JSON.stringify(attributes)]);
                } else {
                    await connection.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [prod.quantity, prod.product_id]);
                }
            }
        }
    }

    const allFieldsToUpdate = { ...orderFields, ...(updates.order_status && { order_status: updates.order_status }) };
    if (Object.keys(allFieldsToUpdate).length > 0) {
        const setClause = Object.keys(allFieldsToUpdate).map(key => {
            const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            return `${dbField} = ?`;
        }).join(', ');
        const values = [...Object.values(allFieldsToUpdate), orderId];
        await connection.query(`UPDATE orders SET ${setClause} WHERE id = ?`, values);
    }

    if (currentOrder.is_pack && Array.isArray(packs)) {
      await connection.query('DELETE FROM order_pack_products WHERE order_id = ?', [orderId]);
      await connection.query('DELETE FROM order_packs WHERE order_id = ?', [orderId]);
      for (const pack of packs) {
          await connection.query(`INSERT INTO order_packs (order_id, pack_id, quantity) VALUES (?, ?, ?)`, [orderId, pack.packId, pack.quantity || 1]);
          if (Array.isArray(pack.products)) {
              for (const prod of pack.products) {
                  await connection.query(`INSERT INTO order_pack_products (order_id, pack_id, product_id, quantity, attributes) VALUES (?, ?, ?, ?, ?)`, [orderId, pack.packId, prod.productId, prod.quantity || 1, JSON.stringify(prod.attributes || {})]);
              }
          }
      }
    } else if (Array.isArray(products)) {
        await connection.query('DELETE FROM order_products WHERE order_id = ?', [orderId]);
        for (const prod of products) {
            await connection.query(`INSERT INTO order_products (order_id, product_id, quantity, attributes) VALUES (?, ?, ?, ?)`, [orderId, prod.productId, prod.quantity, JSON.stringify(prod.attributes || {})]);
        }
    }

    await connection.commit();

    const [updatedOrderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.json({ message: 'Order updated successfully', order: updatedOrderRows[0] });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error updating order:", error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

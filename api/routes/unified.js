const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const upload = require("../config/multer");
const fs = require("fs").promises;
const path = require("path");
const uploadCategory = require("../config/multerCategory");

// Helper function to normalize path
const normalizePath = (filePath) => {
  if (typeof filePath !== "string") return "";
  return filePath.replace(/\\/g, "/");
};

// Get all data (products with their variants and categories)
router.get("/", async (req, res) => {
  try {
    // Get all categories
    let [categories] = await pool.query("SELECT * FROM categories");

    if (categories.length < 1) {
      await pool.query(
        "INSERT INTO categories (name, description) VALUES (?, ?)",
        [
          "not categorized",
          "not categorized product it's mean have no category !",
        ]
      );

      categories = await pool.query("SELECT * FROM categories");
    }

    // Get all products with their category names
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
    `);

    // Get all variants
    const [variants] = await pool.query("SELECT * FROM variants");

    // Format products with their variants
    const formattedProducts = products.map((product) => {
      // Get variants for this product
      const productVariants = variants.filter(
        (v) => v.product_id === product.id
      );

      // Initialize attributes object
      const attributes = {};

      // Process variants to build attributes
      productVariants.forEach((variant) => {
        const variantAttrs = JSON.parse(variant.attributes || "{}");
        Object.entries(variantAttrs).forEach(([key, value]) => {
          if (!attributes[key]) {
            attributes[key] = {};
          }
          attributes[key][value] = variant.stock;
        });
      });

      // Normalize image paths
      let images = [];

      if (product.images) {
        try {
          const parsed = JSON.parse(product.images);
          images = Array.isArray(parsed)
            ? parsed.map((img) => normalizePath(img))
            : [normalizePath(parsed)];
        } catch {
          images = [normalizePath(product.images)];
        }
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category_name,
        category_id: product.category_id,
        description: product.description,
        price: product.price,
        prevPrice: product.prevPrice,
        quantity:
          productVariants.length > 0
            ? productVariants.reduce((sum, v) => sum + v.stock, 0)
            : product.quantity,
        images: images,
        show_on_homepage: product.show_on_homepage,
        presentation: product.presentation,
        attributes: attributes,
      };
    });

    res.json({
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        image: cat.image,
      })),
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create category with image
router.post("/categories", uploadCategory.single("image"), async (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? req.file.path.replace(/\\/g, "/") : null;
  try {
    const [result] = await pool.query(
      "INSERT INTO categories (name, description, image) VALUES (?, ?, ?)",
      [name, description, image]
    );
    res.status(201).json({ id: result.insertId, name, description, image });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      prevPrice,
      category_id,
      attributes,
      quantity,
      show_on_homepage,
      presentation,
    } = req.body;

    // Get uploaded file paths and normalize them
    const uploadedImages = req.files
      ? req.files.map((file) => normalizePath(file.path))
      : [];

    const [result] = await pool.query(
      "INSERT INTO products (name, description, price, prevPrice, quantity, category_id, images, show_on_homepage, presentation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        description,
        Number(price),
        prevPrice ? Number(prevPrice) : 0,
        Number(quantity),
        Number(category_id),
        JSON.stringify(uploadedImages),
        show_on_homepage == "true" ? 1 : 0,
        presentation || "",
      ]
    );

    // If attributes are provided, create variants
    if (attributes) {
      const parsedAttributes = JSON.parse(attributes);
      for (const [attrName, attrValues] of Object.entries(parsedAttributes)) {
        for (const [value, stock] of Object.entries(attrValues)) {
          await pool.query(
            "INSERT INTO variants (product_id, name, sku, price, stock, attributes) VALUES (?, ?, ?, ?, ?, ?)",
            [
              result.insertId,
              `${name} - ${attrName}:${value}`,
              `${name}-${attrName}-${value}-${Date.now()}`,
              price,
              stock,
              JSON.stringify({ [attrName]: value }),
            ]
          );
        }
      }
    }

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      price,
      prevPrice,
      quantity,
      category_id,
      images: uploadedImages,
      show_on_homepage: show_on_homepage === "1" ? 1 : 0,
      presentation,
      attributes: attributes ? JSON.parse(attributes) : {},
    });
  } catch (error) {
    // If there's an error, delete any uploaded files
    if (req.files) {
      await Promise.all(req.files.map((file) => fs.unlink(file.path)));
    }
    res.status(500).json({ message: error.message });
  }
});

// Create variant
router.post("/variants", async (req, res) => {
  const { product_id, name, sku, price, stock, attributes } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO variants (product_id, name, sku, price, stock, attributes) VALUES (?, ?, ?, ?, ?, ?)",
      [product_id, name, sku, price, stock, JSON.stringify(attributes)]
    );
    res.status(201).json({
      id: result.insertId,
      product_id,
      name,
      sku,
      price,
      stock,
      attributes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category with image
router.put(
  "/categories/:id",
  uploadCategory.single("image"),
  async (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? req.file.path.replace(/\\/g, "/") : null;
    try {
      let query = "UPDATE categories SET name = ?, description = ?";
      let params = [name, description];
      if (image) {
        query += ", image = ?";
        params.push(image);
      }
      query += " WHERE id = ?";
      params.push(req.params.id);

      await pool.query(query, params);
      res.json({ id: req.params.id, name, description, image });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update product
router.put("/:id", upload.array("new_images", 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      prevPrice,
      category_id,
      attributes,
      quantity,
      existing_images,
      show_on_homepage,
      presentation,
    } = req.body;

    // Get existing product images
    const [existingProduct] = await pool.query(
      "SELECT images FROM products WHERE id = ?",
      [req.params.id]
    );

    let existingImages = existingProduct[0]?.images
      ? JSON.parse(existingProduct[0].images)
      : [];

    // If existing_images is provided, use it instead of the current images
    if (existing_images) {
      existingImages = JSON.parse(existing_images);
    }

    // Get new uploaded file paths and normalize them
    const newImages = req.files
      ? req.files.map((file) => normalizePath(file.path))
      : [];

    // Combine existing and new images
    const updatedImages = [...existingImages, ...newImages];

    await pool.query(
      "UPDATE products SET name = ?, description = ?, price = ?, prevPrice = ?, quantity = ?, category_id = ?, images = ?, show_on_homepage = ?, presentation = ? WHERE id = ?",
      [
        name,
        description,
        Number(price),
        prevPrice ? Number(prevPrice) : 0,
        Number(quantity),
        Number(category_id),
        JSON.stringify(updatedImages),
        show_on_homepage == "true" ? 1 : 0,
        presentation || "",
        req.params.id,
      ]
    );

    // Update variants if attributes are provided
    if (attributes) {
      // Delete existing variants
      await pool.query("DELETE FROM variants WHERE product_id = ?", [
        req.params.id,
      ]);

      // Create new variants
      const parsedAttributes = JSON.parse(attributes);
      for (const [attrName, attrValues] of Object.entries(parsedAttributes)) {
        for (const [value, stock] of Object.entries(attrValues)) {
          await pool.query(
            "INSERT INTO variants (product_id, name, sku, price, stock, attributes) VALUES (?, ?, ?, ?, ?, ?)",
            [
              req.params.id,
              `${name} - ${attrName}:${value}`,
              `${name}-${attrName}-${value}-${Date.now()}`,
              price,
              stock,
              JSON.stringify({ [attrName]: value }),
            ]
          );
        }
      }
    }

    res.json({
      id: req.params.id,
      name,
      description,
      price,
      prevPrice,
      quantity,
      category_id,
      images: updatedImages,
      show_on_homepage: show_on_homepage == "true" ? 1 : 0,
      presentation,
      attributes: attributes ? JSON.parse(attributes) : {},
    });
  } catch (error) {
    // If there's an error, delete any newly uploaded files
    if (req.files) {
      await Promise.all(req.files.map((file) => fs.unlink(file.path)));
    }
    console.error("Error updating product:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update variant
router.put("/variants/:id", async (req, res) => {
  const { product_id, name, sku, price, stock, attributes } = req.body;
  try {
    await pool.query(
      "UPDATE variants SET product_id = ?, name = ?, sku = ?, price = ?, stock = ?, attributes = ? WHERE id = ?",
      [
        product_id,
        name,
        sku,
        price,
        stock,
        JSON.stringify(attributes),
        req.params.id,
      ]
    );
    res.json({
      id: req.params.id,
      product_id,
      name,
      sku,
      price,
      stock,
      attributes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category
router.delete("/categories/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    // Get product images before deletion
    const [product] = await pool.query(
      "SELECT images FROM products WHERE id = ?",
      [req.params.id]
    );

    // Delete the product (this will cascade delete variants due to foreign key)
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);

    // Delete associated images from filesystem
    if (product[0]?.images) {
      const images = JSON.parse(product[0].images);
      await Promise.all(
        images.map(async (imagePath) => {
          try {
            await fs.unlink(imagePath);
          } catch (err) {
            console.error(`Error deleting image ${imagePath}:`, err);
          }
        })
      );
    }

    res.json({ message: "Product and associated files deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete variant
router.delete("/variants/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM variants WHERE id = ?", [req.params.id]);
    res.json({ message: "Variant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

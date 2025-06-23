const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const upload = require("../config/multer");
const fs = require("fs").promises;
const path = require("path");

// Helper function to normalize path
const normalizePath = (filePath) => {
  return filePath.replace(/\\/g, "/");
};

// Get all packs with their products
router.get("/packs", async (req, res) => {
  try {
    const [packs] = await pool.query("SELECT * FROM packs");

    // Get products for each pack
    const packsWithProducts = await Promise.all(
      packs.map(async (pack) => {
        const [products] = await pool.query(
          `
                SELECT p.*, pp.quantity, pp.attributes 
                FROM products p 
                JOIN pack_products pp ON p.id = pp.product_id 
                WHERE pp.pack_id = ?
            `,
          [pack.id]
        );

        // ✅ Safely parse pack.images
        let packImages = [];
        if (pack.images) {
          try {
            const parsed = JSON.parse(pack.images);
            packImages = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            packImages = pack.images;
          }
        }

        // ✅ Safely parse product.images and calculate correct price based on attributes
        const formattedProducts = await Promise.all(products.map(async (product) => {
          let productImages = [];
          if (product.images) {
            try {
              const parsed = JSON.parse(product.images);
              productImages = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              productImages = product.images;
            }
          }

          // Parse attributes
          const selectedAttributes = product.attributes ? 
            (typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes) : 
            {};

          // Calculate price based on selected attributes
          let finalPrice = Number(product.price); // Start with base price

          if (Object.keys(selectedAttributes).length > 0) {
            // Fetch variants for this product to get the correct price
            const [variants] = await pool.query(
              "SELECT attributes, price FROM variants WHERE product_id = ?",
              [product.id]
            );

            // Find the variant that matches the selected attributes
            for (const variant of variants) {
              const variantAttributes = variant.attributes ? 
                (typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes) : 
                {};

              // Check if this variant matches the selected attributes
              const attributesMatch = Object.keys(selectedAttributes).every(
                key => variantAttributes[key] === selectedAttributes[key]
              );

              if (attributesMatch) {
                finalPrice = Number(variant.price);
                break;
              }
            }
          }

          return {
            id: product.id,
            name: product.name,
            price: finalPrice,
            basePrice : product.price,
            quantity: product.quantity,
            attributes: product.attributes ? typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes :{},
            image: productImages[0] || null, // use the first image or null
          };
        }));

        
        return {
          ...pack,
          images: packImages,
          products: formattedProducts,
        };
      })
    );

    res.json(packsWithProducts);
  } catch (error) {
    console.error("Error fetching packs:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create pack
router.post("/packs", upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, discount, products } = req.body;

    // Get uploaded file paths and normalize them
    const uploadedImages = req.files
      ? req.files.map((file) => normalizePath(file.path))
      : [];

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert pack
      const [result] = await connection.query(
        "INSERT INTO packs (name, description, price, discount, images) VALUES (?, ?, ?, ?, ?)",
        [
          name,
          description,
          Number(price),
          Number(discount),
          JSON.stringify(uploadedImages),
        ]
      );

      // Insert pack products
      const parsedProducts = JSON.parse(products);
      for (const product of parsedProducts) {
        await connection.query(
          "INSERT INTO pack_products (pack_id, product_id, quantity, attributes) VALUES (?, ?, ?, ?)",
          [result.insertId, product.id, product.quantity, JSON.stringify(product.attributes || {})]
        );
      }

      await connection.commit();

      res.status(201).json({
        id: result.insertId,
        name,
        description,
        price,
        discount,
        images: uploadedImages,
        products: parsedProducts,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    // If there's an error, delete any uploaded files
    if (req.files) {
      await Promise.all(req.files.map((file) => fs.unlink(file.path)));
    }
    console.error("Error creating pack:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update pack
router.put("/packs/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, discount, products, existing_images } =
      req.body;
    const packId = req.params.id;

    // Get existing pack images
    const [existingPack] = await pool.query(
      "SELECT images FROM packs WHERE id = ?",
      [packId]
    );

    let images = [];
    if (existingPack[0].images) {
      try {
        const parsed = JSON.parse(existingPack[0].images);
        images = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // fallback: maybe product.images was already parsed, or malformed
        images = existingPack[0].images;
      }
    }

    let existingImages = images;

    // // If existing_images is provided, use it instead of the current images
    if (existing_images) {
      let images = [];
      try {
        const parsed = JSON.parse(existing_images);
        images = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // fallback: maybe product.images was already parsed, or malformed
        images = existing_images;
      }
      
      existingImages = images;
    }

    // Get new uploaded file paths and normalize them
    const newImages = req.files
      ? req.files.map((file) => normalizePath(file.path))
      : [];

    // Combine existing and new images
    const updatedImages = [...existingImages, ...newImages];

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update pack
      await connection.query(
        "UPDATE packs SET name = ?, description = ?, price = ?, discount = ?, images = ? WHERE id = ?",
        [
          name,
          description,
          Number(price),
          Number(discount),
          JSON.stringify(updatedImages),
          packId,
        ]
      );

      // Remove existing pack products and re-insert
      await connection.query("DELETE FROM pack_products WHERE pack_id = ?", [packId]);
      
      const parsedProducts = JSON.parse(products);
      for (const product of parsedProducts) {
        await connection.query(
          "INSERT INTO pack_products (pack_id, product_id, quantity, attributes) VALUES (?, ?, ?, ?)",
          [packId, product.id, product.quantity, JSON.stringify(product.attributes || {})]
        );
      }

      await connection.commit();

      res.status(200).json({
        id: packId,
        name,
        description,
        price,
        discount,
        images: updatedImages,
        products: parsedProducts,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    // If there's an error, delete any uploaded files
    if (req.files) {
      await Promise.all(req.files.map((file) => fs.unlink(file.path)));
    }
    console.error("Error updating pack:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete pack
router.delete("/packs/:id", async (req, res) => {
  try {
    // Get pack images before deletion
    const [pack] = await pool.query("SELECT images FROM packs WHERE id = ?", [
      req.params.id,
    ]);

    // Delete the pack (this will cascade delete pack_products due to foreign key)
    await pool.query("DELETE FROM packs WHERE id = ?", [req.params.id]);

    // Delete associated images from filesystem
    if (pack[0]?.images) {
      const images = [];
      if (pack[0].images) {
        try {
          const parsed = JSON.parse(pack[0].images);
          images = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // fallback: maybe product.images was already parsed, or malformed
          images = pack[0].images;
        }
      }
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

    res.json({ message: "Pack and associated files deleted successfully" });
  } catch (error) {
    console.error("Error deleting pack:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all promo codes
router.get("/promo-codes", async (req, res) => {
  try {
    const [promoCodes] = await pool.query("SELECT * FROM promo_codes");
    res.json(promoCodes);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create promo code
router.post("/promo-codes", async (req, res) => {
  try {
    const { code, discount, type, validFrom, validUntil, isActive } = req.body;

    const [result] = await pool.query(
      "INSERT INTO promo_codes (code, discount, type, validFrom, validUntil, isActive) VALUES (?, ?, ?, ?, ?, ?)",
      [code, Number(discount), type, validFrom, validUntil, isActive]
    );

    res.status(201).json({
      id: result.insertId,
      code,
      discount,
      type,
      validFrom,
      validUntil,
      isActive,
    });
  } catch (error) {
    console.error("Error creating promo code:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update promo code
router.put("/promo-codes/:id", async (req, res) => {
  try {
    const { code, discount, type, validFrom, validUntil, isActive } = req.body;

    await pool.query(
      "UPDATE promo_codes SET code = ?, discount = ?, type = ?, validFrom = ?, validUntil = ?, isActive = ? WHERE id = ?",
      [
        code,
        Number(discount),
        type,
        validFrom,
        validUntil,
        isActive,
        req.params.id,
      ]
    );

    res.json({
      id: req.params.id,
      code,
      discount,
      type,
      validFrom,
      validUntil,
      isActive,
    });
  } catch (error) {
    console.error("Error updating promo code:", error);
    res.status(500).json({ message: error.message });
  }
});

//check promo code
router.get("/check/:code", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM promo_codes WHERE code = ?",
      [req.params.code]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Invalid Code!",
      });
    }

    const code = rows[0];
    const currentDate = new Date();
    const validFrom = new Date(code.validFrom);
    const validUntil = new Date(code.validUntil);

    // Check if the code is expired or not yet valid
    if (currentDate < validFrom || currentDate > validUntil) {
      return res.status(400).json({
        status: 400,
        message: "Code is expired or not yet valid!",
      });
    }

    // Check if the code is active
    if (!code.isActive) {
      return res.status(400).json({
        status: 400,
        message: "Code is not active!",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Congrats!",
      discount: code.discount,
      type: code.type,
    });
  } catch (error) {
    console.error("Error during checking the promo code:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

// Delete promo code
router.delete("/promo-codes/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM promo_codes WHERE id = ?", [req.params.id]);
    res.json({ message: "Promo code deleted successfully" });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

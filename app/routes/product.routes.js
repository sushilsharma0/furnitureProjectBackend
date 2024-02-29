const express = require("express");
const router = express.Router();
const Product = require("../models/product.model");
const multer = require("multer");
const sharp = require("sharp");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Find a product by ID

    // if id is wrong return product not found message
    if (!product) {
      return res.status(500).json({ message: "Product not found" });
    }
    res.status(200).json(product); // Respond with the product in JSON format
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { name, category, description, price, rating } = req.body;

    // Use sharp to compress and convert the image to base64
    const compressedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 300 }) // Adjust the width as needed
      .toBuffer();

    const base64Data = compressedImageBuffer.toString("base64");

    const newProduct = new Product({
      name: name,
      category: category,
      rating: rating,
      description: description,
      price: price,
      image: base64Data,
    });

    await newProduct.save();
    res.status(200).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    // Check if req.file is defined before accessing its properties
    if (req.file && req.file.buffer) {
      // Process the image
      const compressedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 300 })
        .toBuffer()
        .catch((error) => {
          throw new Error(`Error processing image: ${error.message}`);
        });

      const base64Data = compressedImageBuffer.toString("base64");

      // Update fields for both file and non-file updates
      const updateFields = {
        image: base64Data,
        name: req.body.name,
        category: req.body.category,
        rating: req.body.rating,
        description: req.body.description,
        price: req.body.price,
      };

      // Use the { new: true } option to return the updated document
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true }
      );

      if (!updatedProduct) {
        return res
          .status(500)
          .json({ message: "product not found for updating" });
      }

      res.status(200).json(updatedProduct);
    } else {
      // If no file is provided, update only non-file fields
      const updateFields = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        rating: req.body.rating,
        price: req.body.price,
      };

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateFields,
        { new: true }
      );

      if (!updatedProduct) {
        return res
          .status(404)
          .json({ message: "Product not found for updating" });
      }

      res.json(updatedProduct);
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating Product", error: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found for deletion" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
});

module.exports = router;

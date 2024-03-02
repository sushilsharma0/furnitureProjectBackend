const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Cart = require("../models/cart.model");

router.get("/", async (req, res) => {
  try {
    const cart = await Cart.find();
    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get", async (req, res) => {
  try {
    const userId = req.query.userId;
    // Validate userId is not empty and is a valid ObjectId
    if (
      !userId ||
      userId.trim() === "" ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(500).json({ message: "Invalid userId" });
    }

    const cart = await Cart.find({ userId });
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

router.post("/post", async (req, res) => {
  const { product_id, userId } = req.body;

  try {
    if (!userId || userId.trim() === "") {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const existingCartItem = await Cart.findOne({ product_id, userId });

    if (existingCartItem) {
      existingCartItem.quantity += 1;
      await existingCartItem.save();
    } else {
      const cart = new Cart({ product_id, userId });
      await cart.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error adding item to the cart:", error);
    res.status(500).json({ message: "Error adding item to the cart" });
  }
});


router.delete("/delete/:id", async (req, res) => {
  const cartItemId = req.params.id;

  try {
    const deletedCartItem = await Cart.findByIdAndDelete(cartItemId);

    if (!deletedCartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

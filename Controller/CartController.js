const { isValidObjectId } = require("mongoose");
const { CartModel } = require("../models/CartModel");
const { CartItemModel } = require("../models/Cart-Item");

const addItemToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { product } = req.body;

    if (!product || !isValidObjectId(product)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid product ID" });
    }

    // Find or create a cart and add/update product
    const cart = await CartModel.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId } },
      { new: true, upsert: true }
    ).populate("products");

    const cartItem = cart.products.find(
      (p) => p.product.toString() === product
    );

    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      const newCartItem = await CartItemModel.create({
        product,
        quantity: 1,
      });
      cart.products.push(newCartItem._id);
      await cart.save();
    }

    const updatedCart = await CartModel.findById(cart._id).populate({
      path: "products",
      populate: { path: "product", select: "name price category" },
    });

    res.status(200).send({ status: true, cart: updatedCart });
  } catch (error) {
    console.error("Error in addItemToCart:", error.message);
    res.status(500).send({ status: false, message: "Server error", error });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await CartModel.findOne({ user: userId }).populate({
      path: "products",
      populate: { path: "product", select: "name price category" },
    });

    if (!cart) {
      return res.status(404).send({ status: false, message: "Cart not found" });
    }

    res.status(200).send({ status: true, cart });
  } catch (error) {
    console.error("Error in getCart:", error.message);
    res.status(500).send({ status: false, message: "Server error", error });
  }
};

const decreaseQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId || !isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid product ID" });
    }

    const cart = await CartModel.findOne({ user: userId }).populate("products");

    if (!cart) {
      return res.status(404).send({ status: false, message: "Cart not found" });
    }

    const cartItem = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res
        .status(400)
        .send({ status: false, message: "Item not in cart" });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    } else {
      cart.products = cart.products.filter(
        (item) => item._id.toString() !== cartItem._id.toString()
      );
      await cart.save();
      await CartItemModel.findByIdAndDelete(cartItem._id);
    }

    const updatedCart = await CartModel.findById(cart._id).populate({
      path: "products",
      populate: { path: "product", select: "name price category" },
    });

    res.status(200).send({ status: true, cart: updatedCart });
  } catch (error) {
    console.error("Error in decreaseQuantity:", error.message);
    res.status(500).send({ status: false, message: "Server error", error });
  }
};

const removeItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId || !isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid product ID" });
    }

    const cart = await CartModel.findOneAndUpdate(
      { user: userId },
      { $pull: { products: { product: productId } } },
      { new: true }
    ).populate({
      path: "products",
      populate: { path: "product", select: "name price category" },
    });

    if (!cart) {
      return res.status(404).send({ status: false, message: "Cart not found" });
    }

    res
      .status(200)
      .send({ status: true, message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Error in removeItem:", error.message);
    res.status(500).send({ status: false, message: "Server error", error });
  }
};

module.exports = { addItemToCart, getCart, decreaseQuantity, removeItem };

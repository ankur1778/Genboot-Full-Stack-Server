const { isValidObjectId } = require("mongoose");
const { UserModel } = require("../models/Users.model");
const { CartModel } = require("../models/CartModel");
const { CartItemModel } = require("../models/Cart-Item");

const addItemToCart = async (req, res) => {
  try {
    // Check if the user already has a cart
    let cart = await CartModel.findOne({ user: userId }).populate("products");

    if (cart) {
      // Check if the product already exists in the cart
      let cartItem = cart.products.find(
        (p) => p.product.toString() === product
      );

      if (cartItem) {
        // Increment quantity if product exists
        cartItem.quantity += 1;
        await cartItem.save();
      } else {
        // Create a new CartItem and add to the cart
        const newCartItem = await CartItemModel.create({
          product,
          quantity: 1,
        });
        cart.products.push(newCartItem._id);
      }

      await cart.save();
      return res.status(200).send({ status: true, updatedCart: cart });
    } else {
      // Create a new cart for the user
      const newCartItem = await CartItemModel.create({ product, quantity: 1 });
      const newCart = await CartModel.create({
        user: userId,
        products: [newCartItem._id],
      });

      return res.status(201).send({ status: true, newCart });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: false, message: "Server error", error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid user ID" });
    }

    // Find the cart for the user and populate the products
    const cart = await CartModel.findOne({ user: userId }).populate({
      path: "products",
      populate: {
        path: "product",
        select: "name price category",
      },
    });

    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: "Cart not found for this user" });
    }

    return res.status(200).send({ status: true, cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: false, message: "Server error", error: error.message });
  }
};

const decreaseQuantity = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { productId } = req.body;

    // Validate userId and productId
    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid user ID" });
    }

    const user = await UserModel.exists({ _id: userId });
    if (!user) {
      return res.status(404).send({ status: false, message: "User not found" });
    }

    if (!productId || !isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid product ID" });
    }

    // Find the user's cart
    const cart = await CartModel.findOne({ user: userId }).populate("products");
    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: "Cart not found for this user" });
    }

    // Find the product in the cart
    const cartItem = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (cartItem) {
      if (cartItem.quantity > 1) {
        // Decrease the quantity
        cartItem.quantity -= 1;
        await cartItem.save();
      } else {
        // Remove the item if quantity is 1
        cart.products = cart.products.filter(
          (item) => item._id.toString() !== cartItem._id.toString()
        );
        await cart.save();
        await CartItemModel.findByIdAndDelete(cartItem._id); // Remove the CartItem document
      }

      return res.status(200).send({ status: true, updatedCart: cart });
    }

    return res
      .status(400)
      .send({ status: false, message: "Item does not exist in cart" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: false, message: "Server error", error: error.message });
  }
};
const removeItem = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { productId } = req.body;

    // Validate userId and productId
    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid user ID" });
    }

    const user = await UserModel.exists({ _id: userId });
    if (!user) {
      return res.status(404).send({ status: false, message: "User not found" });
    }

    if (!productId || !isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid product ID" });
    }

    // Find the user's cart
    const cart = await CartModel.findOne({ user: userId }).populate("products");
    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: "Cart not found for this user" });
    }

    // Find the product in the cart
    const cartItem = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (cartItem) {
      // Remove the item from the cart and delete its document
      cart.products = cart.products.filter(
        (item) => item._id.toString() !== cartItem._id.toString()
      );
      await cart.save();
      await CartItemModel.findByIdAndDelete(cartItem._id); // Remove the CartItem document

      return res.status(200).send({ status: true, updatedCart: cart });
    }

    return res
      .status(400)
      .send({ status: false, message: "Item does not exist in cart" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: false, message: "Server error", error: error.message });
  }
};

module.exports = { addItemToCart, removeItem, decreaseQuantity, getCart };

const { isValidObjectId } = require("mongoose");
const { CartModel } = require("../models/CartModel");
const { CartItemModel } = require("../models/Cart-Item");
const {
  ProductValidation,
  CartMessages,
  ServerErrorMessage,
} = require("../lib/statusMessage");

const addItemToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { product } = req.body;

    if (!product || !isValidObjectId(product)) {
      return res
        .status(400)
        .send({ status: false, message: ProductValidation.INVALID_PRODUCT });
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
    res
      .status(500)
      .send({ status: false, message: ServerErrorMessage.SERVER_ERROR, error });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await CartModel.findOne({ user: userId }).populate({
      path: "products",
      populate: { path: "product", select: "name price category image" },
    });

    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: CartMessages.NOT_FOUND });
    }
    res.status(200).send(cart);
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: ServerErrorMessage.SERVER_ERROR, error });
  }
};

const decreaseQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId || !isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: ProductValidation.INVALID_PRODUCT });
    }

    const cart = await CartModel.findOne({ user: userId }).populate("products");

    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: CartMessages.NOT_FOUND });
    }

    const cartItem = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res
        .status(400)
        .send({ status: false, message: CartMessages.EMPTY });
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
    res
      .status(500)
      .send({ status: false, message: ServerErrorMessage.SERVER_ERROR, error });
  }
};

const increaseQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId || !isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: ProductValidation.INVALID_PRODUCT });
    }

    const cart = await CartModel.findOne({ user: userId }).populate("products");

    if (!cart) {
      return res
        .status(404)
        .send({ status: false, message: CartMessages.NOT_FOUND });
    }

    const cartItem = cart.products.find(
      (item) => item.product._id.toString() === productId
    );

    if (!cartItem) {
      return res
        .status(400)
        .send({ status: false, message: CartMessages.EMPTY });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity += 1;
      await cartItem.save();
    }

    await cart.save();
    const updatedCart = await CartModel.findById(cart._id).populate({
      path: "products",
      populate: { path: "product", select: "name price category" },
    });

    res.status(200).send({ status: true, cart: updatedCart });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: ServerErrorMessage.SERVER_ERROR, error });
  }
};

const removeItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).send({
        status: false,
        message: "Invalid Product ID",
      });
    }

    // Find the cart first
    const cart = await CartModel.findOne({ user: userId }).populate("products");

    if (!cart) {
      return res.status(404).send({
        status: false,
        message: "Cart not found",
      });
    }

    // Find the CartItem that contains this productId
    const cartItem = await CartItemModel.findOneAndDelete({
      product: productId,
    });

    if (!cartItem) {
      return res.status(404).send({
        status: false,
        message: "Product not found in cart",
      });
    }

    // Remove the reference from the cart
    cart.products = cart.products.filter(
      (item) => item._id.toString() !== cartItem._id.toString()
    );

    await cart.save();

    res.status(200).send({
      status: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
};

module.exports = {
  addItemToCart,
  getCart,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
};

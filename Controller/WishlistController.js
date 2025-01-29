const { isValidObjectId } = require("mongoose");
const { WishListModel } = require("../models/WishListModel");
const { WishListItemModel } = require("../models/WishList-Item");
const { ProductValidation, WishListMessage, UserValidation } = require("../lib/statusMessage");

const addItemToWishList = async (req, res) => {
  try {
    const userId = req.userId;
    let wishlist = await WishListModel.findOne({ user: userId }).populate(
      "products"
    );

    // If no wishlist exists, create a new one
    if (!wishlist) {
      wishlist = new WishListModel({ user: userId, products: [] });
    }

    const { product } = req.body; // Get productId from request body

    // Validate productId
    if (!product || !isValidObjectId(product)) {
      return res
        .status(400)
        .send({ status: false, message: ProductValidation.INVALID_PRODUCT });
    }

    // Create a new WishListItemModel for the product
    const wishListItem = new WishListItemModel({ product });

    // Add product to wishlist if it doesn't already exist
    if (
      !wishlist.products.some((item) => item.product.toString() === product)
    ) {
      wishlist.products.push(wishListItem);
      await wishlist.save();
      return res
        .status(200)
        .send({ status: true, message: WishListMessage.ADDED, wishlist });
    }

    return res
      .status(400)
      .send({ status: false, message: WishListMessage.EXIST });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: ServerErrorMessage.SERVER_ERROR, error: error.message });
  }
};

// Get Wishlist
const getWishList = async (req, res) => {
  try {
    const userId = req.userId;

    // Validate userId
    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: UserValidation.INVALID_USERID });
    }

    // Find the wishlist and populate the products
    const wishlist = await WishListModel.findOne({ user: userId });

    if (!wishlist) {
      return res
        .status(404)
        .send({ status: false, message: WishListMessage.NOT_FOUND });
    }

    return res.status(200).send({ status: true, wishlist });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: ServerErrorMessage.SERVER_ERROR, error: error.message });
  }
};

// Remove Item from Wishlist
const removeItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { product } = req.body;

    // Validate userId and productId
    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: UserValidation.INVALID_USERID });
    }
    if (!product || !isValidObjectId(product)) {
      return res
        .status(400)
        .send({ status: false, message: ProductValidation.INVALID_PRODUCT });
    }

    // Find the user's wishlist
    const wishlist = await WishListModel.findOne({ user: userId });
    if (!wishlist) {
      return res
        .status(404)
        .send({ status: false, message: WishListMessage.NOT_FOUND });
    }

    // Remove the product from the wishlist
    const productIndex = wishlist.products.findIndex(
      (item) => item.toString() === product
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .send({ status: false, message: WishListMessage.EMPTY });
    }

    wishlist.products.splice(productIndex, 1); // Remove product
    await wishlist.save();

    return res.status(200).send({
      status: true,
      message: WishListMessage.REMOVED,
      updatedWishList: wishlist,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: ServerErrorMessage.SERVER_ERROR, error: error.message });
  }
};

module.exports = { addItemToWishList, removeItem, getWishList };

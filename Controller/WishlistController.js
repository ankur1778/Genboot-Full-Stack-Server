const { isValidObjectId } = require("mongoose");
const { WishListModel } = require("../models/WishListModel");
const { WishListItemModel } = require("../models/WishList-Item");
const {
  ProductValidation,
  WishListMessage,
  UserValidation,
  ServerErrorMessage,
} = require("../lib/statusMessage");

const addItemToWishList = async (req, res) => {
  try {
    const userId = req.userId;
    let wishlist = await WishListModel.findOne({ user: userId });

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

    // Check if the product is already in the wishlist
    const existingWishListItem = await WishListItemModel.findOne({ product });

    if (
      existingWishListItem &&
      wishlist.products.includes(existingWishListItem._id)
    ) {
      return res
        .status(400)
        .send({ status: false, message: WishListMessage.EXIST });
    }

    // Create and save a new WishListItemModel for the product
    const wishListItem = new WishListItemModel({ product });
    await wishListItem.save();

    // Add the new wishlist item ObjectId to the wishlist
    wishlist.products.push(wishListItem._id);
    await wishlist.save();

    return res
      .status(200)
      .send({ status: true, message: WishListMessage.ADDED, wishlist });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: ServerErrorMessage.SERVER_ERROR,
      error: error.message,
    });
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

    const wishlist = await WishListModel.findOne({ user: userId }).populate({
      path: "products",
      model: "WishListItemModel",
      populate: {
        path: "product",
        select: "name price category image description",
      },
    });

    if (!wishlist) {
      return res
        .status(404)
        .send({ status: false, message: WishListMessage.NOT_FOUND });
    }

    return res.status(200).send(wishlist);
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: ServerErrorMessage.SERVER_ERROR,
      error: error.message,
    });
  }
};

// Remove Item from Wishlist
const removeItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { product } = req.body;

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

    // Find and update the wishlist in one query
    const updatedWishlist = await WishListModel.findOneAndUpdate(
      { user: userId },
      { $pull: { products: product } },
      { new: true }
    ).populate("products");

    if (!updatedWishlist) {
      return res
        .status(404)
        .send({ status: false, message: WishListMessage.NOT_FOUND });
    }

    // Remove item from WishListItemModel
    const wishlistItem = await WishListItemModel.findOneAndDelete({
      product: product,
    });

    if (!wishlistItem) {
      return res
        .status(404)
        .send({ status: false, message: "Product not found in Wishlist" });
    }

    return res.status(200).send({
      status: true,
      message: WishListMessage.REMOVED,
      updatedWishList: updatedWishlist,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: ServerErrorMessage.SERVER_ERROR,
      error: error.message,
    });
  }
};

module.exports = { addItemToWishList, removeItem, getWishList };

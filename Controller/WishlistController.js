const { isValidObjectId } = require("mongoose");
const { WishListModel } = require("../models/WishListModel");
const { WishListItemModel } = require("../models/WishList-Item");

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
        .send({ status: false, message: "Invalid product ID" });
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
        .send({ status: true, message: "Item added to wishlist", wishlist });
    }

    return res
      .status(400)
      .send({ status: false, message: "Item already exists in wishlist" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: false, message: "Server error", error: error.message });
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
        .send({ status: false, message: "Invalid user ID" });
    }
    console.log(userId);

    // Find the wishlist and populate the products
    const wishlist = await WishListModel.findOne({ user: userId });

    if (!wishlist) {
      return res
        .status(404)
        .send({ status: false, message: "Wishlist not found for this user" });
    }

    return res.status(200).send({ status: true, wishlist });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: false, message: "Server error", error: error.message });
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
        .send({ status: false, message: "Invalid user ID" });
    }
    if (!product || !isValidObjectId(product)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid product ID" });
    }

    // Find the user's wishlist
    const wishlist = await WishListModel.findOne({ user: userId });
    if (!wishlist) {
      return res
        .status(404)
        .send({ status: false, message: "Wishlist not found for this user" });
    }

    // Remove the product from the wishlist
    const productIndex = wishlist.products.findIndex(
      (item) => item.toString() === product
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .send({ status: false, message: "Product not found in wishlist" });
    }

    wishlist.products.splice(productIndex, 1); // Remove product
    await wishlist.save();

    return res.status(200).send({
      status: true,
      message: "Product removed successfully",
      updatedWishList: wishlist,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: false, message: "Server error", error: error.message });
  }
};

module.exports = { addItemToWishList, removeItem, getWishList };

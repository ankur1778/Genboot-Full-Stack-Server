const express = require("express");
const router = express.Router();

const userDetails = require("../MiddleWares/jwt_decode");
const {
  addItemToWishList,
  getWishList,
  removeItem,
} = require("../Controller/WishlistController");
const wishlistValidation = require("../MiddleWares/WishListValidaion");

router.use(userDetails);

router.post("/add-to-wishlist/",wishlistValidation, addItemToWishList);
router.get("/get-wishlist/", getWishList);
router.delete("/remove-from-wishlist/",wishlistValidation, removeItem);

module.exports = router;

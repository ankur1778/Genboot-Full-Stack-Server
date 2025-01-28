const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const cartValidation = require("../MiddleWares/CartValidation")
const {
  addItemToCart,
  getCart,
  decreaseQuantity,
  removeItem,
} = require("../Controller/CartController");

router.post("/add-to-cart/:userId",verifyToken,cartValidation, addItemToCart);
router.get("/get-cart/:userId",verifyToken, getCart);
router.patch("/decrease-quantity/:userId",verifyToken, decreaseQuantity);
router.delete("/remove-item/:userId",verifyToken, removeItem);

module.exports = router;

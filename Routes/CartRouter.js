const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getCart,
  decreaseQuantity,
  removeItem,
} = require("../Controller/CartController");

router.post("/add-to-cart/:userId", addItemToCart);
router.get("/get-cart/:userId", getCart);
router.patch("/decrease-quantity/:userId", decreaseQuantity);
router.delete("/remove-item/:userId", removeItem);

module.exports = router;

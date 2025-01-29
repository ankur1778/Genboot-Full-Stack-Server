const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getCart,
  decreaseQuantity,
  removeItem,
} = require("../Controller/CartController");
const userDetails = require("../MiddleWares/jwt_decode");
const cartValidation = require("../MiddleWares/CartValidation");

router.use(userDetails);

router.post("/add-to-cart", cartValidation, addItemToCart);
router.get("/get-cart", getCart);
router.patch("/decrease-quantity", cartValidation, decreaseQuantity);
router.delete("/remove-item", cartValidation, removeItem);

module.exports = router;

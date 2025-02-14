const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getCart,
  decreaseQuantity,
  removeItem,
  increaseQuantity,
} = require("../Controller/CartController");
const userDetails = require("../MiddleWares/jwt_decode");
const cartValidation = require("../MiddleWares/CartValidation");
const cors = require("cors");

router.use(userDetails);
router.use(cors({ origin: "*" }));

router.post("/add-to-cart", addItemToCart);
router.get("/get-cart", getCart);
router.put("/decrease-quantity", cartValidation, decreaseQuantity);
router.put("/increase-quantity", cartValidation, increaseQuantity);
router.delete("/remove-item", cartValidation, removeItem);

module.exports = router;

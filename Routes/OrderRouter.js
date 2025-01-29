const { OrderModel } = require("../models/Orders.model");
const express = require("express");
const { OrderItemModel } = require("../models/Order-Item");
const verifyToken = require("../middlewares/verifyToken");
const validateOrder = require("../MiddleWares/validateOrder");
const userDetails = require("../MiddleWares/jwt_decode");
const {
  getAllOrders,
  getSingleOrder,
  postOrder,
  updateStatus,
  deleteOrder,
  userOrder,
} = require("../Controller/OrderController");

const router = express.Router();
router.use(userDetails);

// Get all orders
router.get("/get-all-orders/", getAllOrders);

// Get a single order
router.get("/specificorder/:id", verifyToken, getSingleOrder);

// Create a new order
router.post("/postorder", postOrder);

// Update the status of an order
router.put("/updatestatus/:id", updateStatus);

// Delete an order
router.delete("/deleteorder/:id", verifyToken, deleteOrder);

// Get orders for a specific user
router.get("/get/userorders/", userOrder);

module.exports = router;

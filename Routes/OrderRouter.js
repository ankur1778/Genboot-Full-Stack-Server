const express = require("express");
const userDetails = require("../MiddleWares/jwt_decode");
const {
  getAllOrders,
  getSingleOrder,
  postOrder,
  updateStatus,
  deleteOrder,
  userOrder,
} = require("../Controller/OrderController");
const adminAuth = require("../middlewares/AdminValidation");

const router = express.Router();
router.use(userDetails);

// Get all orders
router.get("/get-all-orders/", adminAuth, getAllOrders);

// Get a single order
router.get("/specificorder/:id", adminAuth, getSingleOrder);

// Create a new order
router.post("/postorder", postOrder);

// Update the status of an order
router.put("/updatestatus/:id", adminAuth, updateStatus);

// Delete an order
router.delete("/deleteorder/:id", deleteOrder);

// Get orders for a specific user
router.get("/get/userorders/", userOrder);

module.exports = router;

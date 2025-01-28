const { OrderModel } = require("../models/Orders.model");
const express = require("express");
const { OrderItemModel } = require("../models/Order-Item");
const adminAuth = require("../middlewares/AdminValidation");
const verifyToken = require("../middlewares/verifyToken");
const validateOrder = require("../MiddleWares/validateOrder");
const router = express.Router();

// Get all orders
router.get("/", verifyToken, async (req, res) => {
  try {
    const orderList = await OrderModel.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 });

    if (!orderList) return res.status(500).json({ success: false });

    res.status(200).json(orderList);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single order
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      });

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new order
router.post("/", verifyToken, async (req, res) => {
  const { error } = validateOrder(req.body);
  if (error)
    return res.status(400).json({ success: false, message: error.message });

  try {
    const orderItemsIds = await Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItemModel({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );

    const totalPrices = await Promise.all(
      orderItemsIds.map(async (orderItemId) => {
        const orderItem = await OrderItemModel.findById(orderItemId).populate(
          "product",
          "price"
        );
        return orderItem.product.price * orderItem.quantity;
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    const order = new OrderModel({
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      totalPrice,
      user: req.user.id,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update the status of an order
router.put("/updatestatus/:id", adminAuth, async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "Shipped", "Delivered", "Cancelled"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }

  try {
    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete an order
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const order = await OrderModel.findByIdAndDelete(req.params.id);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    await Promise.all(
      order.orderItems.map((orderItemId) =>
        OrderItemModel.findByIdAndDelete(orderItemId)
      )
    );

    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get orders for a specific user
router.get("/get/userorders/:userid", verifyToken, async (req, res) => {
  try {
    const userOrderList = await OrderModel.find({ user: req.params.userid })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ dateOrdered: -1 });

    if (!userOrderList.length)
      return res
        .status(404)
        .json({ success: false, message: "No orders found for this user" });

    res.status(200).json(userOrderList);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

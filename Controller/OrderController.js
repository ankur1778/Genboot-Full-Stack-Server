const { OrderMessage } = require("../lib/statusMessage");
const { OrderItemModel } = require("../models/Order-Item");
const { OrderModel } = require("../models/Orders.model");
const ADMIN = process.env.ROLE_ADMIN;

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orderList = await OrderModel.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 });

    if (!orderList) return res.status(500).json({ success: false });

    res.status(200).json(orderList);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single order
const getSingleOrder = async (req, res) => {
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
        .json({ success: false, message: OrderMessage.NOT_FOUND });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//Post an order
const postOrder = async (req, res) => {
  const { error } = validateOrder(req.body);
  const userId = req.userId;
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
      user: userId,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//Update Status of order
const updateStatus = async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "Shipped", "Delivered", "Cancelled"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: OrderMessage.INVALID_STATUS });
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
        .json({ success: false, message: OrderMessage.NOT_FOUND });

    res
      .status(200)
      .json({ success: true, message: OrderMessage.STATUS_UPDATED, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Deletae an order
const deleteOrder = async (req, res) => {
  try {
    const order = await OrderModel.findByIdAndDelete(req.params.id);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: OrderMessage.NOT_FOUND });

    await Promise.all(
      order.orderItems.map((orderItemId) =>
        OrderItemModel.findByIdAndDelete(orderItemId)
      )
    );

    res
      .status(200)
      .json({ success: true, message: OrderMessage.DELETED });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Specific User Order
const userOrder = async (req, res) => {
  const userId = req.userId;
  try {
    const userOrderList = await OrderModel.find({ user: userId })
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
        .json({ success: false, message: OrderMessage.NOT_FOUND });

    res.status(200).json(userOrderList);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  postOrder,
  updateStatus,
  deleteOrder,
  userOrder,
};

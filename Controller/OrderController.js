const { OrderMessage, ServerErrorMessage } = require("../lib/statusMessage");
const validateOrder = require("../MiddleWares/validateOrder");
const { OrderItemModel } = require("../models/Order-Item");
const { OrderModel } = require("../models/Orders.model");
const { ProductModel } = require("../models/Product.model");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    let offset = (page - 1) * limit;
    const totalOrders = await OrderModel.countDocuments();
    const orderList = await OrderModel.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 })
      .limit(limit)
      .skip(offset);

    if (!orderList) return res.status(500).json({ success: false });

    res.status(200).json({ orderList, totalOrders });
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
    await Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        await ProductModel.updateOne(
          { _id: orderItem.product },
          { $inc: { countInStock: -orderItem.quantity } }
        );
      })
    );
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//Update Status of order
const ALLOWED_STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate status
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: OrderMessage.INVALID_STATUS,
      });
    }

    // Validate ID format before querying DB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    // Update order status
    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: OrderMessage.NOT_FOUND,
      });
    }

    return res.status(200).json({
      success: true,
      message: OrderMessage.STATUS_UPDATED,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ServerErrorMessage.SERVER_ERROR,
      error: error.message,
    });
  }
};

// Delete an order
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
    await Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        await ProductModel.updateOne(
          { _id: orderItem.product },
          { $inc: { countInStock: +orderItem.quantity } }
        );
      })
    );
    res.status(200).json({ success: true, message: OrderMessage.DELETED });
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

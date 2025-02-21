const { v4: uuidv4 } = require("uuid"); 
const { OrderModel } = require("../models/Orders.model");
const { PaymentModel } = require("../models/Payment.model");
const { validatePayment } = require("../MiddleWares/validatePayment");

const processPayment = async (req, res) => {
  const { error } = validatePayment(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const { card_number, UPI_id, order_id, user_id, amount } = req.body;

  try {
    // Check if the order exists
    const order = await OrderModel.findById(order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== user_id) {
      return res.status(403).json({ success: false, message: "You are not authorized to pay for this order" });
    }

    if (amount !== order.totalPrice) {
      return res.status(400).json({ success: false, message: "Amount does not match the order total" });
    }

    // Generate a unique transaction ID using UUID
    const transaction_id = uuidv4();

    // Create a payment record
    const newPayment = new PaymentModel({
      order_id: order._id,
      user_id: user_id,
      amount: amount,
      card_number: card_number,
      UPI_id: UPI_id, 
      status: "Success",
      transaction_id: transaction_id, 
    });

    // Save the payment record
    const savedPayment = await newPayment.save();
    order.paymentStatus = "Paid";  
    order.status = "Completed"; 
    await order.save();

    res.status(201).json({
      success: true,
      message: "Payment successful",
      payment: savedPayment,
      order: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { processPayment };

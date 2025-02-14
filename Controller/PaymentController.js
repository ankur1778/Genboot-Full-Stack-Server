const stripe = require("stripe")
const {payment} = require("../models/Payment.model")
const {OrderModel} = require('../models/Orders.model')

const handlePayment = async(req, res) =>{
    const {orderId, token, amount} = req.body;
    try{
        const order = await OrderModel.findById(orderId)
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const charge = await stripe.charges.create({
            amount: amount,
            currency: "rupees",
            description: "payment of order" + orderId,
            source: token,
        });
        const payment = new payment({
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status,
            payment_method: charge.payment_method,
            transaction_id: charge.id,
            order_id: orderId,
        });
        await payment.save();
        res.status(200).json({
            success: true,
            message: "payment successful",
            payment: payment, //return the payment detail save in db
        })
    }catch(error){
        console.error("payment error:", error);
        res.status(500).json({
            success: false,
            message: "Payment failed",
            error: error.message,
        });
    }
}

//get all the payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate("order_id", "orderItems totalPrice user");

        if (!payments) return res.status(404).json({ success: false, message: "No payments found" });

        res.status(200).json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//get the single payment
const getSinglePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate("order_id", "orderItems totalPrice user");

        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

        res.status(200).json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//get the user payment detail
const getUserPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user_id: req.userId }).populate("order_id", "orderItems totalPrice user");

        if (!payments.length) return res.status(404).json({ success: false, message: "No payments found for this user" });

        res.status(200).json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    handlePayment,
    getAllPayments,
    getSinglePayment,
    getUserPayments
};
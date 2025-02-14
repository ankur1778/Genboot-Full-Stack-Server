const mongoose = require("mongoose")

const PaymentSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    payment_method: {
        type: String,
        required: true,
    },
    transaction_id: {
        type: String,
        required: true,
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

const payment = mongoose.model("payment", PaymentSchema)
module.exports = {payment};
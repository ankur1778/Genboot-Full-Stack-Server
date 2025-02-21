const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Orders",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  card_number: {
    type: String,
    required: false,
  },
  UPI_id: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  transaction_id: {
    type: String,
    required: true,
  },
  datePaid: {
    type: Date,
    default: Date.now,
  },
});

const PaymentModel = mongoose.model("Payment", paymentSchema);

module.exports = { PaymentModel };

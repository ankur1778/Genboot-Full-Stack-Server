const mongoose = require("mongoose");

const cartItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true,
  },
});

const CartItemModel = mongoose.model("CartItems", cartItemSchema);

module.exports = { CartItemModel };

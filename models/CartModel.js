const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CartItems",
      required: true,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

const CartModel = mongoose.model("CartModel", cartSchema);

module.exports = { CartModel };

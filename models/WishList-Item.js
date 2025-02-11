const mongoose = require("mongoose");

const wishListItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products", // Reference to Product model
    required: true,
  },
});

const WishListItemModel = mongoose.model("WishListItemModel", wishListItemSchema);

module.exports = { WishListItemModel };

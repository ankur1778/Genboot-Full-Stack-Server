const mongoose = require("mongoose");

const wishListSchema = mongoose.Schema({
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WishListItemModel", // Reference to WishListItemModel
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

const WishListModel = mongoose.model("WishListModel", wishListSchema);

module.exports = { WishListModel };

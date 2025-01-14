const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true, default: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
    required: true,
  },
  countInStock: { type: Number, required: true, min: 0, max: 200 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const ProductModel = mongoose.model("Products", productSchema);

module.exports = { ProductModel };

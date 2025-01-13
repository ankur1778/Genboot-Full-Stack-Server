const { ProductModel } = require("../models/Product.model");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { CategoryModel } = require("../models/Category.model");
const verifyToken = require("../MiddleWares/verifyToken");
const adminAuth = require("../middlewares/AdminValidation");

router.get("/", verifyToken, async (req, res) => {
  try {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }
    const products = await ProductModel.find(filter)
      .select("-_id -countInStock ")
      .populate("category");
    res.send(products);
  } catch (error) {
    res.send({ msg: "Cannot get the products" });
    console.log(error);
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id)
      .populate("category")
      .select(" -_id -countInStock");
    if (!product) {
      return res.status(404).json({
        message: "The product with the given ID is not found",
        success: false,
      });
    }
    res.status(200).send(product);
  } catch (error) {
    res
      .status(500)
      .send({ message: "An error occurred", error: error.message });
  }
});

router.post("/", adminAuth, async (req, res) => {
  const { id, name, description, price, category, countInStock, rating } =
    req.body;
  try {
    const category = await CategoryModel.findById(req.body.category);
    if (!category) res.status(400).send("Invalid Category");
    const foundCategory = await CategoryModel.findById(category);
    if (!foundCategory) {
      return res.status(400).json({ message: "Invalid Category" });
    }
    const newProduct = new ProductModel({
      id,
      name,
      description,
      price,
      category: foundCategory._id,
      countInStock,
      rating,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

router.patch("/:id", adminAuth, async (req, res) => {
  const ID = req.params.id;
  const payload = req.body;
  try {
    const category = await CategoryModel.findById(req.body.category);
    if (!category) res.status(400).send("Invalid Category");
    await ProductModel.findByIdAndUpdate({ _id: ID }, payload);
    res.status(200).json({ message: "Updated the product", success: true });
  } catch (err) {
    res.status(404).send({ success: false, error: err.message });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  const ID = req.params.id;
  try {
    const token = req.headers.authorization;
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (decoded) {
        await ProductModel.findByIdAndDelete({ _id: ID });
        res.status(200).json({ message: "Deleted the product", success: true });
      } else {
        res
          .status(404)
          .json({ msg: "Some thing went wrong", error: err.message });
      }
    });
  } catch (err) {
    res.status(404).send({ success: false, error: err.message });
  }
});

router.get("/get/count", async (req, res) => {
  const productCount = await ProductModel.countDocuments();
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

module.exports = router;

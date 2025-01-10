const { ProductModel } = require("../models/Product.model");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { CategoryModel } = require("../models/Category.model");

router.get("/", async (req, res) => {
  let query = req.query;
  try {
    const token = req.headers.authorization;
    jwt.verify(token, `${JWT_SECRET}`, async (err, decoded) => {
      if (decoded) {
        const products = await ProductModel.find(query).select(
          " -countInStock"
        ).populate('category');
        res.send([products]);
      } else {
        res.send({ msg: "Some thing went wrong", error: err.message });
      }
    });
  } catch (error) {
    res.send({ msg: "Cannot get the products" });
    console.log(error);
  }
});
router.get("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization;
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (decoded) {
        const product = await ProductModel.findById(req.params.id).populate('category');
        if (!product) {
          return res.status(404).json({
            message: "The product with the given ID is not found",
            success: false,
          });
        }
        res.status(200).send(product);
      } else {
        res.status(403).send({ message: "Unauthorized", error: err.message });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "An error occurred", error: error.message });
  }
});

router.post("/", async (req, res) => {
  const { id, name, description, price, category, countInStock, rating } =
    req.body;

  try {
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
module.exports = router;

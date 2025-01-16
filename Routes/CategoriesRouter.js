const { CategoryModel } = require("../models/Category.model");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../MiddleWares/verifyToken");
const adminAuth = require("../middlewares/AdminValidation");
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/", verifyToken, async (req, res) => {
  let query = req.query;
  try {
    const categories = await CategoryModel.find(query);
    res.send(categories);
  } catch (error) {
    res.send({ msg: "Cannot get the categories" });
    console.log(error);
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      res.status(500).json({
        message: "The category with given id is not defined",
        success: false,
      });
    }
    res.status(200).send(category);
  } catch (error) {
    res.status(404).send({ msg: "Something went wrong", error: error.message });
  }
});

router.post("/", adminAuth, async (req, res) => {
  const { name } = req.body;
  try {
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "Category already exists", success: false });
    }
    let newCategory = new CategoryModel({
      name: req.body.name,
    });
    await newCategory.save();

    if (!newCategory)
      return res.status(404).send("This category can't be created");
    res.send(newCategory);
  } catch (error) {
    res.status(404).json({ message: "Error", error: error.message });
  }
});

router.patch("/:id", adminAuth, async (req, res) => {
  const ID = req.params.id;
  const payload = req.body;
  try {
    await CategoryModel.findByIdAndUpdate({ _id: ID }, payload);
    res.status(200).json({ message: "Updated the Category", success: true });
  } catch (err) {
    res.status(404).send({ success: false, error: err.message });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  const ID = req.params.id;
  try {
    await CategoryModel.findByIdAndDelete({ _id: ID });
    res.status(200).json({ message: "Deleted the Category", success: true });
  } catch (err) {
    res.status(404).send({ success: false, error: err.message });
  }
});

module.exports = router;

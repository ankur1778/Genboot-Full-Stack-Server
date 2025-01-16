const { ProductModel } = require("../models/Product.model");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { CategoryModel } = require("../models/Category.model");
const verifyToken = require("../MiddleWares/verifyToken");
const adminAuth = require("../middlewares/AdminValidation");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

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

router.post("/", adminAuth, uploadOptions.single("image"), async (req, res) => {
  const {
    id,
    name,
    description,
    price,
    image,
    category,
    countInStock,
    rating,
  } = req.body;
  try {
    const foundCategory = await CategoryModel.findById(category);
    if (!foundCategory) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    const file = req.file;
    if (!file) return res.status(400).send("No image in the request");

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const newProduct = new ProductModel({
      id,
      name,
      description,
      price,
      category: foundCategory._id,
      image: `${basePath}${fileName}`,
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
    await ProductModel.findByIdAndDelete({ _id: ID });
    res.status(200).json({ message: "Deleted the product", success: true });
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

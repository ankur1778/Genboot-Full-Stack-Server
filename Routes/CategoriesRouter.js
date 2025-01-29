const { CategoryModel } = require("../models/Category.model");
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
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
  let query = req.query;
  try {
    const categories = await CategoryModel.find(query);
    res.send(categories);
  } catch (error) {
    res.send({ msg: "Cannot get the categories" });
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

router.patch(
  "/:id",
  adminAuth,
  uploadOptions.single("image"),
  async (req, res) => {
    const ID = req.params.id;
    const { name } = req.body; // No need to destructure 'image' from req.body since it's coming from the uploaded file.
    try {
      const file = req.file;
      if (!file) return res.status(400).send("No image in the request");

      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      // Build the update object dynamically
      const updateData = {
        name,
        image: `${basePath}${fileName}`,
      };

      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        ID, // Pass the ID directly
        updateData, // Only the fields to update
        { new: true } // Return the updated document
      );

      if (!updatedCategory)
        return res.status(404).send({ success: false, message: "Category not found" });

      res.status(200).json({ message: "Updated the category", success: true });
    } catch (err) {
      res.status(500).send({ success: false, error: err.message });
    }
  }
);

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

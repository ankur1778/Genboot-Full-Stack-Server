const { UserModel } = require("../models/Users.model");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const adminAuth = require("../middlewares/AdminValidation");
const userDetails = require("../MiddleWares/jwt_decode");
const {
  ServerErrorMessage,
  AuthValidation,
} = require("../lib/statusMessage");

router.use(cors());
router.use(userDetails);
// Get all users (Admin only)
router.get("/users", adminAuth, async (req, res) => {
  try {
    let { name, sort } = req.query;
    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const totalUsers = await UserModel.countDocuments(filter);
    const limit = Number(req.query.limit);
    const page = Number(req.query.page);
    let offset = (page - 1) * limit;

    let sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(":");
      sortOptions[field] = order === "desc" ? -1 : 1;
    }

    const users = await UserModel.find(filter)
      .limit(limit)
      .skip(offset)
      .sort(sortOptions);

    res.status(200).json({ users, totalUsers });
  } catch (error) {
    res
      .status(500)
      .json({ msg: ServerErrorMessage.SERVER_ERROR, error: error.message });
  }
});

// Update a user
router.put("/users/update/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    await UserModel.findByIdAndUpdate(id, payload);
    res.status(200).send({ msg: AuthValidation.UPDATED });
  } catch (error) {
    res
      .status(500)
      .send({ msg: ServerErrorMessage.SERVER_ERROR, error: error.message });
  }
});

// Delete a user
router.delete("/users/delete/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    await UserModel.findByIdAndDelete(id);
    res.status(200).send({ msg: AuthValidation.DELETED });
  } catch (error) {
    res
      .status(500)
      .send({ msg: ServerErrorMessage.SERVER_ERROR, error: error.message });
  }
});

router.get("/get/userscount", async (req, res) => {
  const usersCount = await UserModel.countDocuments();
  if (!usersCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    users: usersCount,
  });
});

module.exports = router;

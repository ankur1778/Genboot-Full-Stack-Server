const { UserModel } = require("../models/Users.model");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const adminAuth = require("../middlewares/AdminValidation");
const userDetails = require("../MiddleWares/jwt_decode");
const { AdminMessage, ServerErrorMessage } = require("../lib/statusMessage");

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
    res.status(200).send({ msg: "User updated successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ msg: "Cannot update the user", error: error.message });
  }
});

// Delete a user
router.delete("/users/delete/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    await UserModel.findByIdAndDelete(id);
    res.status(200).send({ msg: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ msg: "Cannot delete the user", error: error.message });
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

//Get the userDetails by userId
router.get("/users/:userId",  async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user); 
  } catch (error) {
    res.status(500).json({ msg: "Error fetching user details", error: error.message });
  }
});

module.exports = router;

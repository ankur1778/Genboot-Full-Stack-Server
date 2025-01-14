const { UserModel } = require("../models/Users.model");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const adminAuth = require("../middlewares/AdminValidation");

router.use(cors());

// Get all users (Admin only)
router.get("/users",adminAuth, async (req, res) => {
  try {
    const users = await UserModel.find(req.query);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ msg: "Cannot get the users", error: error.message });
  }
});


// Update a user
router.patch("/users/update/:id", adminAuth, async (req, res) => {
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

module.exports = router;

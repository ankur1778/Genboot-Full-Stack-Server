const { UserModel } = require("../models/Users.model");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

router.use(cors());

router.get("/users", async (req, res) => {
  let query = req.query;
  try {
    const users = await UserModel.find(query);
    res.send(users);
    // const token = req.headers.authorization;
    // jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    //   if (err) {
    //     return res
    //       .status(401)
    //       .send({ msg: "Invalid token", error: err.message });
    //   }
    //   // Proceed if decoded is valid
    //   const users = await UserModel.find(query);
    //   res.send(users);
    // });
  } catch (error) {
    res.send({ msg: "Cannot get the users" });
    console.log(error);
  }
});

router.patch("/users/update/:id", async (req, res) => {
  const ID = req.params.id;
  const payload = req.body;
  try {
    const token = req.headers.authorization;
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (decoded) {
        await UserModel.findByIdAndUpdate({ _id: ID }, payload);
        res.send({ msg: "Updated the User" });
      } else {
        res.send({ msg: "Some thing went wrong", error: err.message });
      }
    });
  } catch (err) {
    res.send({ msg: "Cannot update the user", error: err.message });
  }
});

router.delete("/users/delete/:id", async (req, res) => {
  const ID = req.params.id;
  const payload = req.body;
  try {
    const token = req.headers.authorization;
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (decoded) {
        await UserModel.findByIdAndDelete({ _id: ID }, payload);
        res.send({ msg: "Deleted the User" });
      } else {
        res.send({ msg: "Some thing went wrong", error: err.message });
      }
    });
  } catch (err) {
    res.send({ msg: "Cannot delete the user", error: err.message });
  }
});

module.exports = router;

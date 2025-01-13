const { UserModel } = require("../models/Users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv");

const signup = async (req, res) => {
  try {
    const { name, email, password, phNo, roleId } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({
          message: "User already exists with this email",
          success: false,
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      phNo,
      roleId,
    });

    await newUser.save();

    res.status(201).json({
      message: "User Registered Successfully",
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phNo: newUser.phNo,
        roleId: newUser.roleId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Wrong Credentials", success: false });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Wrong Credentials", success: false });
    }
    const token = jwt.sign(
      { userId: user._id, roleId: user.roleId, project: "e-commerce" },
      process.env.JWT_SECRET
    );

    res.json({
      message: "Login Successful",
      success: true,
      token,
      roleId: user.roleId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login Unsuccessful",
      success: false,
    });
  }
};

module.exports = {
  signup,
  login,
};

const { isValidObjectId } = require("mongoose");
const { UserModel } = require("../models/Users.model");

const cartValidation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { product } = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid or missing user ID" });
    }

    const userExists = await UserModel.exists({ _id: userId });
    if (!userExists) {
      return res
        .status(404)
        .send({ status: false, message: "User not found" });
    }

    if (!product || !isValidObjectId(product)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid or missing product ID" });
    }

    next();
  } catch (error) {
    console.error("Error in cartValidation:", error.message);
    res.status(500).send({ status: false, message: "Server error", error });
  }
};

module.exports = cartValidation;

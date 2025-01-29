const { isValidObjectId } = require("mongoose");
const { UserModel } = require("../models/Users.model");

const wishlistValidation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { product } = req.body;

    // Validate userId and productId
    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid user ID" });
    }

    const user = await UserModel.exists({ _id: userId });
    if (!user) {
      return res.status(404).send({ status: false, message: "User not found" });
    }

    if (!product || !isValidObjectId(product)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid product ID" });
    }
    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

module.exports = wishlistValidation;

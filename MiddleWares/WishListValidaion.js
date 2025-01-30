const { isValidObjectId } = require("mongoose");
const { UserModel } = require("../models/Users.model");
const { UserValidation, ProductValidation, ServerErrorMessage } = require("../lib/statusMessage");

const wishlistValidation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { product } = req.body;

    // Validate userId and productId
    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: UserValidation.INVALID_USERID });
    }

    const user = await UserModel.exists({ _id: userId });
    if (!user) {
      return res.status(404).send({ status: false, message: UserValidation.NOT_FOUND });
    }

    if (!product || !isValidObjectId(product)) {
      return res
        .status(400)
        .send({ status: false, message: ProductValidation.INVALID_PRODUCT });
    }
    next();
  } catch (error) {
    res
      .status(500)
      .json({ msg: ServerErrorMessage.SERVER_ERROR, error: error.message });
  }
};

module.exports = wishlistValidation;

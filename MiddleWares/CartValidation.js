const { isValidObjectId } = require("mongoose");
const { UserModel } = require("../models/Users.model");
const { UserValidation, ProductValidation, ServerErrorMessage } = require("../lib/statusMessage");

const cartValidation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { product } = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: UserValidation.INVALID_USERID });
    }

    const userExists = await UserModel.exists({ _id: userId });
    if (!userExists) {
      return res
        .status(404)
        .send({ status: false, message: UserValidation.NOT_FOUND });
    }

    if (!product || !isValidObjectId(product)) {
      return res
        .status(400)
        .send({ status: false, message: ProductValidation.INVALID_PRODUCT });
    }

    next();
  } catch (error) {
    res.status(500).send({ status: false, message: ServerErrorMessage.SERVER_ERROR, error });
  }
};

module.exports = cartValidation;

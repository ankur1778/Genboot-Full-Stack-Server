const Joi = require("joi");

const validateOrder = (data) => {
  const schema = Joi.object({
    orderItems: Joi.array()
      .items(
        Joi.object({
          quantity: Joi.number().min(1).required(),
          product: Joi.string().required(),
        })
      )
      .required(),
    shippingAddress1: Joi.string().required(),
    shippingAddress2: Joi.string().allow(""),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().allow(""),
    country: Joi.string().required(),
    phone: Joi.string().required(),
    status: Joi.string().valid("Pending", "Shipped", "Delivered", "Cancelled"),
  });
  return schema.validate(data);
};

module.exports = validateOrder;

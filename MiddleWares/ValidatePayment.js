const Joi = require("joi");

const validatePayment = (data) => {
    const schema = Joi.object({
        card_number: Joi.string().optional(),
        UPI_id: Joi.string().optional(),
        order_id: Joi.string().required(),
        user_id: Joi.string().required(),
        amount: Joi.number().required(),
    });
    return schema.validate(data);
};

module.exports = validatePayment;

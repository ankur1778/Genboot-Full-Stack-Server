const Joi = require("joi");

const validatePayment = (data) =>{
    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        currency: Joi.string().valid("rupees").required(),
        status: Joi.string().valid("succeeded", "failed").required(),
        transaction_id: Joi.string().required(),
        order_id: Joi.string().required(),
    })
    return schema.validate(data)
}

module.exports = validatePayment;
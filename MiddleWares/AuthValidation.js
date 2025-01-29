const Joi = require('joi');
const { AuthValidation } = require('../lib/statusMessage');

const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().max(20).required(),
        email: Joi.string().email().required(),
        phNo: Joi.string().pattern(/^\d+$/).min(8).max(12).required(),
        password: Joi.string().min(4).max(20).required()
    }).unknown()
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ "msg": AuthValidation.INVALID, error })
    }
    next()
}

const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(20).required()
    })
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ "msg": AuthValidation.INVALID, error })
    }
    next()
}

module.exports = {
    signupValidation,
    loginValidation
}
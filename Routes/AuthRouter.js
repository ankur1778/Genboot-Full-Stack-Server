const { signup, login } = require('../Controller/AuthController')
const { signupValidation, loginValidation } = require('../MiddleWares/AuthValidation')

const router = require('express').Router()

router.post('/login', loginValidation, login)
router.post('/register', signupValidation, signup)

module.exports = router

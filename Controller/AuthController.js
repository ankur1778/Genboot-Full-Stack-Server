const UserModel = require('../models/Users.model');
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
    try {
        const { name, email, password, phNo } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists with this email", success: false });
        }
        const newUser = new UserModel({
            name,
            email,
            password,
            phNo,
        });
        await newUser.save();
        res.status(201).json({
            message: "User Registered Successfully",
            success: true,
            user: { id: newUser._id, name: newUser.name, email: newUser.email, phNo: newUser.phNo },
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
    const { email, password } = req.body
    const token = jwt.sign({ project: 'e-commerce' }, /*key :  */ 'Mohit Raj Singh')
    try {
        const user = await UserModel.find({ email, password })
        if (user.length > 0) {
            res.send({ "msg": "Login Successfull", "token": token })
        }
        else {
            res.send({ "msg": "Wrong Credentials" })
        }
    }
    catch (error) {
        res.send({ "msg": "Login Unsuccessfull" })
    }
}

module.exports = {
    signup,
    login
};

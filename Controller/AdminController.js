const UserModel = require('../models/Users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv')


const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Wrong Credentials", success: false });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong Credentials", success: false });
        }
        const roleId = await UserModel.findOne({roleId})
        if(!roleId === process.env.ROLE_ADMIN){
            res.send("You are not allowed")
        }
        const token = jwt.sign(
            { userId: user._id, roleId: user.roleId, project: 'e-commerce' },
            process.env.JWT_SECRET, 
        );

        res.json({
            message: "Login Successfull",
            success: true,
            token,
            roleId: user.roleId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Login Unsuccessfull",
            success: false,
        });
    }
};

module.exports = adminLogin
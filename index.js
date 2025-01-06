const express = require('express')
const { connection } = require('./config/db')
const { UserModel } = require('./models/Users.model')
const jwt = require('jsonwebtoken')
require('dotenv')

const port = process.env.port || 3100

const app = express()

app.use(express.json())

app.post("/login",async (req,res)=>{
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
})

app.post("/register",async (req,res)=>{
    const userDetail = req.body
    try {
        const user = new UserModel(userDetail)
        await user.save()
        res.send({ "msg": "User Registered" })
    } catch (error) {
        console.error(error);
        res.send({ "msg": "Cannot register", "error": error.message })
    }
})

app.listen(port,async()=>{
    try {
        await connection
        console.log("Connected to DB");
    } catch (error) {
        console.error(error.message);
    }
    console.log("Server is running");
})
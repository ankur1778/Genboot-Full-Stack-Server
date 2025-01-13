const express = require('express')
const { connection } = require('./config/db')
const { UserModel } = require('./models/Users.model')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const {signup, login} = require('./Controller/AuthController')
require('dotenv')
const cors = require('cors')
const { signupValidation, loginValidation } = require('./MiddleWares/AuthValidation')

const port = process.env.port || 3100

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.json())


app.post("/login", loginValidation, login)

app.post("/register", signupValidation, signup)

app.listen(port, async () => {
    try {
        await connection
        console.log("Connected to DB");
    } catch (error) {
        console.error(error.message);
    }
    console.log(`Server is running on ${port}`);
})
const express = require('express')
const { connection } = require('./config/db')
const bodyParser = require('body-parser')
const AuthRouter = require('./Routes/AuthRouter')
require('dotenv').config()
const cors = require('cors')

const port = process.env.port || 3100

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use("/auth", AuthRouter)

app.listen(port, async () => {
    try {
        await connection
        console.log("Connected to DB");
    } catch (error) {
        console.error(error.message);
    }
    console.log(`Server is running on ${port}`);
})
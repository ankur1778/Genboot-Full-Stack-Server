const express = require("express");
const { connection } = require("./config/db");
const bodyParser = require("body-parser");
const AuthRouter = require("./Routes/AuthRouter");
require("dotenv").config();
const AdminRouter = require("./Routes/AdminRouter");
const ProductRouter = require("./Routes/ProductRouter");
const CategoryRouter = require("./Routes/CategoriesRouter");
const cors = require("cors");

const port = process.env.port || 3100;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use("/auth", AuthRouter);
app.use("/admin", AdminRouter);
app.use("/products", ProductRouter);
app.use("/categories", CategoryRouter);

app.listen(port, async () => {
  try {
    await connection;
    console.log("Connected to DB");
  } catch (error) {
    console.error(error.message);
  }
  console.log(`Server is running on ${port}`);
});

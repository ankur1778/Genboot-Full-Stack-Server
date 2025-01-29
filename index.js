const express = require("express");
const { connection } = require("./config/db");
const bodyParser = require("body-parser");
const AuthRouter = require("./Routes/AuthRouter");
require("dotenv").config();
const AdminRouter = require("./Routes/AdminRouter");
const ProductRouter = require("./Routes/ProductRouter");
const CategoryRouter = require("./Routes/CategoriesRouter");
const OrderRouter = require("./Routes/OrderRouter");
const CartRouter = require("./Routes/CartRouter");
const WishlistRouter = require("./Routes/WishListRouter");
const cors = require("cors");

const port = process.env.port || 3100;

const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(express.json());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

app.use("/auth", AuthRouter);
app.use("/admin", AdminRouter);
app.use("/products", ProductRouter);
app.use("/categories", CategoryRouter);
app.use("/orders", OrderRouter);
app.use("/cart", CartRouter);
app.use("/wishlist", WishlistRouter);

app.listen(port, "0.0.0.0", async () => {
  try {
    await connection;
    console.log("Connected to DB");
  } catch (error) {
    console.error(error.message);
  }
  console.log(`Server is running on ${port}`);
});

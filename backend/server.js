require("dotenv").config();
const express = require("express");
const cors = require("cors");

const products = require("./routes/products");
const cart = require("./routes/cart");
const orders = require("./routes/orders");
const artisan = require("./routes/artisan");
const stats = require("./routes/stats");


const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", products);
app.use("/api/cart", cart);
app.use("/api/orders", orders);
app.use("/api/my-products", artisan);
app.use("/api/stats", stats);

app.listen(3000, () => console.log("Backend running on port 3000"));
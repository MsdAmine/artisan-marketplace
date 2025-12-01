const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectMongo } = require("./db/mongo");

const productsRoute = require("./routes/products");
const artisansRoute = require("./routes/artisan");
const cartRoute = require("./routes/cart");
const ordersRoute = require("./routes/orders");
const statsRoute = require("./routes/stats");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", productsRoute);
app.use("/api/artisans", artisansRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/stats", statsRoute);

async function startServer() {
  await connectMongo();     // IMPORTANT
  console.log("DB is ready");

  app.listen(3000, () => {
    console.log("Backend running on port 3000");
  });
}

startServer();

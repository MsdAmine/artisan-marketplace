const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectMongo } = require("./db/mongo");

const app = express();
const authRoute = require("./routes/auth");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const uploadRoutes = require("./routes/upload");
const productsRoute = require("./routes/products");
const artisanRoute = require("./routes/artisan");  // ✔️ correct
const cartRoute = require("./routes/cart");
const ordersRoute = require("./routes/orders");
const statsRoute = require("./routes/stats");

// Mount routes
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productsRoute);
app.use("/api/artisans", artisanRoute); // ✔️ correct
app.use("/api/cart", cartRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/stats", statsRoute);
app.use("/api/auth", authRoute);

async function startServer() {
  await connectMongo();
  console.log("DB connected");

  app.listen(3000, () => {
    console.log("Backend running at http://localhost:3000");
  });
}

startServer();

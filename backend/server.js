const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectMongo } = require("./db/mongo");

const app = express();   // ✅ Create app BEFORE using routes

app.use(cors());
app.use(express.json());

// Static folder (local image fallback)
app.use("/uploads", express.static("uploads"));

// Import routes AFTER creating app
const uploadRoutes = require("./routes/upload");
const productsRoute = require("./routes/products");
const artisansRoute = require("./routes/artisan");
const cartRoute = require("./routes/cart");
const ordersRoute = require("./routes/orders");
const statsRoute = require("./routes/stats");

// Mount routes
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productsRoute);
app.use("/api/artisans", artisansRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", ordersRoute);   // <‑‑ this one works now
app.use("/api/stats", statsRoute);

async function startServer() {
  await connectMongo();
  console.log("DB connected");

  app.listen(3000, () => {
    console.log("Backend running at http://localhost:3000");
  });
}

startServer();
  
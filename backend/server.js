const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectMongo } = require("./db/mongo");

const uploadRoutes = require("./routes/upload");
const productsRoute = require("./routes/products");
const artisansRoute = require("./routes/artisan");
const cartRoute = require("./routes/cart");
const ordersRoute = require("./routes/orders");
const statsRoute = require("./routes/stats");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use(express.json());

// Serve local uploads if needed (not used with Cloudinary but ok to keep)
app.use("/uploads", express.static("uploads"));

// -------------------------
// 🔥 ROUTES
// -------------------------
app.use("/api/upload", uploadRoutes);       // Cloudinary upload route
app.use("/api/products", productsRoute);
app.use("/api/artisans", artisansRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/stats", statsRoute);

// -------------------------
// 🔥 START SERVER
// -------------------------
async function startServer() {
  await connectMongo();
  console.log("DB is ready");

  app.listen(3000, () => {
    console.log("Backend running on port 3000");
  });
}

startServer();

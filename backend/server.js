const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./db/mongo");

const app = express();
app.use(cors());
app.use(express.json());

// Load routes AFTER database is connected
async function startServer() {
  await connectDB();                // <-- Wait for DB
  console.log("DB is ready");

  app.use("/api/products", require("./routes/products"));
  app.use("/api/artisans", require("./routes/artisan"));
  app.use("/api/cart", require("./routes/cart"));
  app.use("/api/orders", require("./routes/orders"));
  app.use("/api/stats", require("./routes/stats"));

  app.listen(3000, () => console.log("Backend running on port 3000"));
}

startServer();

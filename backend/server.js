// server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: ".env" });
const neo4j = require("neo4j-driver"); // <-- Added neo4j-driver dependency

const { connectMongo } = require("./db/mongo");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const uploadRoutes = require("./routes/upload");
const productsRoute = require("./routes/products");
const artisanRoute = require("./routes/artisan"); 
const cartRoute = require("./routes/cart");
const ordersRoute = require("./routes/orders");
const statsRoute = require("./routes/stats");
const authRoute = require("./routes/auth");
const recommendationRoutes = require("./routes/recommendations");

// --- NEO4J INITIALIZATION LOGIC ---
let neo4jDriver; 

function initNeo4jDriver() {
    const driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    );

    // Optional check to confirm connection on startup
    driver.getServerInfo()
        .then(() => console.log("Neo4j driver ready!"))
        .catch((err) => console.error("Neo4j connection error:", err));
        
    return driver;
}

// Attach driver to every request before hitting the router
app.use((req, res, next) => {
    req.neo4jDriver = neo4jDriver;
    next();
});

app.use("/api/recommendations", recommendationRoutes);



app.use("/api/upload", uploadRoutes);
app.use("/api/products", productsRoute);
app.use("/api/artisans", artisanRoute); 
app.use("/api/cart", cartRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/stats", statsRoute);
app.use("/api/auth", authRoute);


async function startServer() {
    await connectMongo();
    console.log("DB connected");

    // Initialize the Neo4j driver with authenticated credentials
    neo4jDriver = initNeo4jDriver(); 

    app.listen(3000, () => {
        console.log("Backend running at http://localhost:3000");
    });
}

startServer();
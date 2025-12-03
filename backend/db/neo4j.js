// db/neo4j.js
const neo4j = require("neo4j-driver");

// Function to initialize and return the driver instance
const initNeo4jDriver = () => {
    // You must use the environment variables proven correct by your test script
    const driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    );

    // Optional: Log connection status on server startup
    driver.getServerInfo()
        .then(() => console.log("Neo4j driver ready!"))
        .catch((err) => console.error("Neo4j connection error:", err));
        
    return driver;
};

// You can export the driver immediately, or export the function to be called in server.js
module.exports = { initNeo4jDriver };
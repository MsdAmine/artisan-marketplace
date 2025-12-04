const express = require("express");
const router = express.Router();

// ✔ Test route
router.get("/test", (req, res) => {
  // We can now safely check if the driver was passed correctly
  if (!req.neo4jDriver) {
    return res.status(500).send("Neo4j Driver not initialized in server.js");
  }
  res.send("Neo4j recommendation route working!");
});

// ✔ Track user actions
router.post("/track", async (req, res) => {
  const { userId, productId, action } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: "Missing data" });
  }

  // FIX: Retrieve the authenticated driver from the request object
  const driver = req.neo4jDriver;
  if (!driver)
    return res.status(500).json({ message: "Neo4j connection not ready" });

  const session = driver.session({ database: process.env.NEO4J_DATABASE }); // Use the database name from env

  try {
    await session.run(
      `
      MERGE (u:User {id: $userId})
      MERGE (p:Product {id: $productId})
      MERGE (u)-[r:VIEWED]->(p)
      ON CREATE SET r.count = 1
      ON MATCH SET r.count = r.count + 1
      `,
      { userId, productId }
    );

    res.json({ message: "Interaction tracked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Tracking failed" });
  } finally {
    await session.close();
  }
});


router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const session = driver.session();

    const query = `
      MATCH (u:User {id: $userId})-[:VIEWED]->(p:Product)
      MATCH (other:User)-[:VIEWED]->(p)
      MATCH (other)-[:VIEWED]->(rec:Product)
      WHERE rec.id <> p.id
      RETURN DISTINCT rec
      LIMIT 10
    `;

    const result = await session.run(query, { userId });

    const products = result.records.map((record) => {
      const node = record.get("rec");
      return node.properties;
    });

    res.json({ products });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ error: "Recommendation failed" });
  }
});

module.exports = router;

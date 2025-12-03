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
    if (!driver) return res.status(500).json({ message: "Neo4j connection not ready" });

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

// ✔ Get recommendations
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

    // FIX: Retrieve the authenticated driver from the request object
    const driver = req.neo4jDriver;
    if (!driver) return res.status(500).json({ message: "Neo4j connection not ready" });

  const session = driver.session({ database: process.env.NEO4J_DATABASE }); // Use the database name from env

  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:VIEWED]->(p:Product)
      MATCH (other:User)-[:VIEWED]->(p)
      MATCH (other)-[r:VIEWED]->(rec:Product)
      WHERE u.id <> other.id
      RETURN rec.id AS id, COUNT(r) AS score
      ORDER BY score DESC
      LIMIT 10
      `
      ,
      { userId }
    );

    const products = result.records.map((row) => ({
      id: row.get("id"),
      score: row.get("score"),
    }));

    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  } finally {
    await session.close();
  }
});

module.exports = router;
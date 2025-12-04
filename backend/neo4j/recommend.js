// backend/neo4j/recommend.js (CORRECTED)
const neo4j = require("neo4j-driver");
// const driver = require("./driver"); // <-- DELETE THIS LINE

// The driver MUST be the first argument passed from the route handler.
async function recommendForUser(driver, userId, limit = 10) {
  // ^ Now using 'driver' which will be passed in from the route.

  // Check if the passed object is a driver instance (optional safety check)
  if (!driver || typeof driver.session !== "function") {
    throw new TypeError("Neo4j driver instance is missing or invalid.");
  }

  // Now 'driver.session' will work correctly.
  const session = driver.session({ defaultAccessMode: neo4j.session.READ });

  const query = `
      MATCH (u:User {id: $userId})-[:VIEWED]->(p:Product)<-[:VIEWED]-(other:User)
      WHERE other <> u
      MATCH (other)-[:VIEWED]->(rec:Product)
      WHERE NOT (u)-[:VIEWED]->(rec)
      RETURN rec, count(*) AS score
      ORDER BY score DESC
      LIMIT $limit
    `;

  try {
    const result = await session.run(query, {
      userId,
      limit: neo4j.int(limit),
    });

    const products = result.records.map((record) => {
      const recNode = record.get("rec");
      const score = record.get("score");

      return {
        id: recNode.properties.id,
        name: recNode.properties.name || null,
        score: score.toNumber ? score.toNumber() : Number(score),
      };
    });

    return products;
  } finally {
    await session.close();
  }
}

module.exports = { recommendForUser };

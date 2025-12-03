const { getSession } = require("./driver");

async function recommendForUser(userId, limit = 10) {
  const session = await getSession();

  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:VIEWED|BOUGHT]->(p:Product)-[:HAS_CATEGORY]->(c:Category)
      MATCH (other:User)-[:VIEWED|BOUGHT]->(p)
      MATCH (other)-[:VIEWED|BOUGHT]->(rec:Product)
      WHERE rec.id <> p.id

      RETURN DISTINCT rec.id AS productId
      LIMIT $limit
      `,
      { userId, limit }
    );

    return result.records.map((r) => r.get("productId"));
  } finally {
    await session.close();
  }
}

module.exports = { recommendForUser };

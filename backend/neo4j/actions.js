const { getSession } = require("./driver");

async function recordView(userId, product) {
  const session = await getSession();

  try {
    await session.run(
      `
      MERGE (u:User {id: $userId})
      MERGE (p:Product {id: $productId, name: $name})
      MERGE (c:Category {name: $category})
      MERGE (p)-[:HAS_CATEGORY]->(c)
      MERGE (u)-[:VIEWED]->(p)
      `,
      {
        userId,
        productId: product._id.toString(),
        name: product.name,
        category: product.category,
      }
    );
  } finally {
    await session.close();
  }
}

async function recordPurchase(userId, product) {
  const session = await getSession();

  try {
    await session.run(
      `
      MERGE (u:User {id: $userId})
      MERGE (p:Product {id: $productId, name: $name})
      MERGE (u)-[:BOUGHT]->(p)
      `,
      {
        userId,
        productId: product._id.toString(),
        name: product.name,
      }
    );
  } finally {
    await session.close();
  }
}

module.exports = { recordView, recordPurchase };

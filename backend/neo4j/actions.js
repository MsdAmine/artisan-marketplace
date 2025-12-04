const neo4j = require("neo4j-driver");

// We accept 'driver' as the first argument to match the logic in recommendations.js
async function trackInteraction(driver, userId, productId, action = "view") {
  // 1. Safety Check: Ensure driver is valid
  if (!driver || typeof driver.session !== "function") {
    throw new TypeError("Neo4j driver instance is missing or invalid in trackInteraction.");
  }

  // 2. Open a Session
  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    
    await session.run(
      `
      MERGE (u:User {id: $userId})
      MERGE (p:Product {id: $productId})
      MERGE (u)-[r:VIEWED]->(p)
      ON CREATE SET r.count = 1, r.lastViewed = timestamp(), r.action = $action
      ON MATCH SET r.count = r.count + 1, r.lastViewed = timestamp(), r.action = $action
      `,
      {
        userId,
        productId,
        action,
      }
    );

    console.log(`User ${userId} ${action} product ${productId}`);
  } catch (error) {
    console.error("Error in trackInteraction:", error);
    throw error;
  } finally {
    await session.close();
  }
}

async function followArtisan(driver, userId, artisanId) {
  if (!driver) throw new Error("Driver not provided");
  
  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (u:User {id: $userId})
      MERGE (a:User {id: $artisanId}) -- Assuming Artisans are also Users nodes
      MERGE (u)-[r:FOLLOWS]->(a)
      RETURN r
      `,
      { userId, artisanId }
    );
    console.log(`User ${userId} followed Artisan ${artisanId}`);
  } finally {
    await session.close();
  }
}

async function unfollowArtisan(driver, userId, artisanId) {
  if (!driver) throw new Error("Driver not provided");
  
  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})-[r:FOLLOWS]->(a:User {id: $artisanId})
      DELETE r
      `,
      { userId, artisanId }
    );
  } finally {
    await session.close();
  }
}

async function getArtisanStats(driver, artisanId, currentUserId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (a:User {id: $artisanId})
      OPTIONAL MATCH (u:User)-[r:FOLLOWS]->(a)
      WITH a, count(r) as followers
      
      -- Check if current user is following
      OPTIONAL MATCH (me:User {id: $currentUserId})-[isFollowing:FOLLOWS]->(a)
      
      RETURN followers, count(isFollowing) > 0 as isFollowing
      `,
      { artisanId, currentUserId: currentUserId || "" }
    );
    
    const record = result.records[0];
    return {
      followers: record.get("followers").toNumber(),
      isFollowing: record.get("isFollowing")
    };
  } finally {
    await session.close();
  }
}

// 4. Export the function
module.exports = { trackInteraction, followArtisan, unfollowArtisan, getArtisanStats };
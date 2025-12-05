const neo4j = require("neo4j-driver");

/* ---------------------------------------------------------
   TRACK INTERACTION (Products analytics)
--------------------------------------------------------- */
async function trackInteraction(driver, userId, productId, action = "view") {
  if (!driver || typeof driver.session !== "function") {
    throw new TypeError("Invalid Neo4j driver instance in trackInteraction()");
  }

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
      { userId, productId, action }
    );

    console.log(`User ${userId} ${action} product ${productId}`);
  } catch (error) {
    console.error("Error in trackInteraction:", error);
    throw error;
  } finally {
    await session.close();
  }
}

/* ---------------------------------------------------------
   FOLLOW ARTISAN
--------------------------------------------------------- */
async function followArtisan(driver, userId, artisanId) {
  if (!driver) throw new Error("Driver not provided to followArtisan()");

  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    await session.run(
      `
      MERGE (u:User {id: $userId})
      MERGE (a:User {id: $artisanId})  
      MERGE (u)-[:FOLLOWS]->(a)
      `,
      { userId, artisanId }
    );

    console.log(`User ${userId} followed artisan ${artisanId}`);
  } finally {
    await session.close();
  }
}

/* ---------------------------------------------------------
   UNFOLLOW ARTISAN
--------------------------------------------------------- */
async function unfollowArtisan(driver, userId, artisanId) {
  if (!driver) throw new Error("Driver not provided to unfollowArtisan()");

  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})-[r:FOLLOWS]->(a:User {id: $artisanId})
      DELETE r
      `,
      { userId, artisanId }
    );

    console.log(`User ${userId} unfollowed artisan ${artisanId}`);
  } finally {
    await session.close();
  }
}

/* ---------------------------------------------------------
   GET ARTISAN FOLLOW STATS
--------------------------------------------------------- */
async function getArtisanStats(driver, artisanId, currentUserId) {
  if (!driver) throw new Error("Neo4j driver missing in getArtisanStats()");

  const session = driver.session({ defaultAccessMode: neo4j.session.READ });

  try {
    const result = await session.run(
      `
      // Count all followers of the artisan
      MATCH (a:User {id: $artisanId})
      OPTIONAL MATCH (u:User)-[:FOLLOWS]->(a)
      WITH a, count(u) AS followers

      // Check if current user follows the artisan
      OPTIONAL MATCH (me:User {id: $currentUserId})-[f:FOLLOWS]->(a)
      RETURN followers, f IS NOT NULL AS isFollowing
      `,
      {
        artisanId,
        currentUserId: currentUserId ?? null,
      }
    );

    if (result.records.length === 0) {
      return { followers: 0, isFollowing: false };
    }

    const record = result.records[0];

    return {
      followers:
        typeof record.get("followers").toNumber === "function"
          ? record.get("followers").toNumber()
          : record.get("followers"),

      isFollowing: record.get("isFollowing") || false,
    };
  } catch (err) {
    console.error("Neo4j error in getArtisanStats:", err);
    return { followers: 0, isFollowing: false };
  } finally {
    await session.close();
  }
}

/* ---------------------------------------------------------
   GET FOLLOWERS FOR ARTISAN
--------------------------------------------------------- */
async function getFollowers(driver, artisanId) {
  if (!driver) throw new Error("Neo4j driver missing in getFollowers()");

  const session = driver.session({ defaultAccessMode: neo4j.session.READ });

  try {
    const result = await session.run(
      `
      MATCH (u:User)-[:FOLLOWS]->(a:User {id: $artisanId})
      RETURN u.id AS followerId
      `,
      { artisanId }
    );

    return result.records.map((record) => record.get("followerId"));
  } catch (err) {
    console.error("Neo4j error in getFollowers:", err);
    return [];
  } finally {
    await session.close();
  }
}

module.exports = {
  trackInteraction,
  followArtisan,
  unfollowArtisan,
  getArtisanStats,
  getFollowers,
};

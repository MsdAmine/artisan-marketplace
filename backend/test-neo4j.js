require("dotenv").config();
const neo4j = require("neo4j-driver");

async function test() {
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );

  try {
    await driver.getServerInfo();
    console.log("Connected!");
  } catch (err) {
    console.error(err);
  } finally {
    await driver.close();
  }
}

test();

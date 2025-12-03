// seed.js — populate MongoDB with dummy data
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectMongo, getDB } = require("./db/mongo");
const { ObjectId } = require("mongodb");

async function seed() {
  console.log("🌱 Starting database seeding…");

  await connectMongo();
  const db = getDB();

  const users = db.collection("users");
  const products = db.collection("products");

  // Clear old data
  await users.deleteMany({});
  await products.deleteMany({});

  console.log("✔️ Cleared existing collections.");

  // Helper to hash passwords
  const hash = async (pwd) => await bcrypt.hash(pwd, 10);

  // ---------------------------------------------------
  // 1. USERS
  // ---------------------------------------------------
  const userData = [
    // Admins
    {
      name: "Admin One",
      email: "admin1@example.com",
      password: await hash("admin123"),
      role: "admin",
      createdAt: new Date(),
    },
    {
      name: "Admin Two",
      email: "admin2@example.com",
      password: await hash("admin123"),
      role: "admin",
      createdAt: new Date(),
    },
    {
      name: "Super Admin",
      email: "admin3@example.com",
      password: await hash("admin123"),
      role: "admin",
      createdAt: new Date(),
    },

    // Artisans
    {
      name: "Artisan Woodcraft",
      email: "wood@artisan.com",
      password: await hash("password123"),
      role: "artisan",
      createdAt: new Date(),
    },
    {
      name: "Artisan Ceramics",
      email: "ceramic@artisan.com",
      password: await hash("password123"),
      role: "artisan",
      createdAt: new Date(),
    },
    {
      name: "Artisan Leather",
      email: "leather@artisan.com",
      password: await hash("password123"),
      role: "artisan",
      createdAt: new Date(),
    },
    {
      name: "Artisan Metalwork",
      email: "metal@artisan.com",
      password: await hash("password123"),
      role: "artisan",
      createdAt: new Date(),
    },
    {
      name: "Artisan Painter",
      email: "painting@artisan.com",
      password: await hash("password123"),
      role: "artisan",
      createdAt: new Date(),
    },

    // Customers
    {
      name: "Customer One",
      email: "customer1@example.com",
      password: await hash("customer123"),
      role: "customer",
      createdAt: new Date(),
    },
    {
      name: "Customer Two",
      email: "customer2@example.com",
      password: await hash("customer123"),
      role: "customer",
      createdAt: new Date(),
    },
    {
      name: "Customer Three",
      email: "customer3@example.com",
      password: await hash("customer123"),
      role: "customer",
      createdAt: new Date(),
    },
    {
      name: "Customer Four",
      email: "customer4@example.com",
      password: await hash("customer123"),
      role: "customer",
      createdAt: new Date(),
    },
    {
      name: "Customer Five",
      email: "customer5@example.com",
      password: await hash("customer123"),
      role: "customer",
      createdAt: new Date(),
    },
  ];

  const insertedUsers = await users.insertMany(userData);

  console.log("✔️ Inserted users:", insertedUsers.insertedCount);

  // Get artisan IDs
  const artisanIds = Object.values(insertedUsers.insertedIds).slice(3, 8);

  // ---------------------------------------------------
  // 2. PRODUCTS
  // ---------------------------------------------------
  const productData = [
    {
      name: "Table en bois massif",
      description: "Table artisanale en chêne massif.",
      price: 250,
      stock: 5,
      category: "Bois",
      artisanId: artisanIds[0],
      image: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Bol en céramique",
      description: "Bol fait main, finition émaillée.",
      price: 35,
      stock: 20,
      category: "Céramique",
      artisanId: artisanIds[1],
      image: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Sac en cuir",
      description: "Sac artisanal en cuir véritable.",
      price: 120,
      stock: 8,
      category: "Cuir",
      artisanId: artisanIds[2],
      image: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Sculpture métallique",
      description: "Sculpture décorative en acier forgé.",
      price: 300,
      stock: 3,
      category: "Métal",
      artisanId: artisanIds[3],
      image: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Peinture sur toile",
      description: "Toile originale peinte à la main.",
      price: 180,
      stock: 2,
      category: "Art",
      artisanId: artisanIds[4],
      image: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const insertedProducts = await products.insertMany(productData);
  console.log("✔️ Inserted products:", insertedProducts.insertedCount);

  console.log("🌱 Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed", err);
  process.exit(1);
});

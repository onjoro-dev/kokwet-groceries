import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import slugify from "slugify";
import { connectDB } from "../config/db";
import User from "../models/User";
import Category from "../models/Category";
import Product from "../models/Product";

/**
 * Populates the database with a starter admin account, categories, and products
 * so the storefront and admin dashboard have real data to show immediately.
 * Run with: npm run seed
 */
const categories = [
  { name: "Fresh Produce", icon: "🥬", order: 1 },
  { name: "Dairy & Eggs", icon: "🥚", order: 2 },
  { name: "Meat & Poultry", icon: "🍗", order: 3 },
  { name: "Bakery", icon: "🍞", order: 4 },
  { name: "Beverages", icon: "🥤", order: 5 },
  { name: "Pantry Staples", icon: "🌾", order: 6 },
  { name: "Household & Cleaning", icon: "🧼", order: 7 },
  { name: "Personal Care", icon: "🧴", order: 8 },
];

const productSeeds: Record<string, { name: string; price: number; compareAtPrice?: number; unit: string; brand?: string; featured?: boolean }[]> = {
  "Fresh Produce": [
    { name: "Sukuma Wiki (Kales)", price: 20, unit: "1 bunch" },
    { name: "Ripe Tomatoes", price: 80, unit: "1 kg" },
    { name: "Red Onions", price: 120, unit: "1 kg" },
    { name: "Irish Potatoes", price: 90, unit: "2 kg", compareAtPrice: 110 },
    { name: "Sweet Bananas", price: 60, unit: "1 dozen" },
    { name: "Avocados (Hass)", price: 150, unit: "5 pieces", featured: true },
    { name: "Carrots", price: 70, unit: "1 kg" },
    { name: "Green Bell Peppers", price: 100, unit: "500 g" },
  ],
  "Dairy & Eggs": [
    { name: "Brookside Fresh Milk", price: 65, unit: "500 ml", brand: "Brookside" },
    { name: "Farm Eggs", price: 420, unit: "Tray of 30", featured: true },
    { name: "Yoghurt - Plain", price: 150, unit: "500 ml" },
    { name: "Gouda Cheese Slices", price: 380, unit: "200 g" },
    { name: "Salted Butter", price: 250, unit: "250 g" },
  ],
  "Meat & Poultry": [
    { name: "Whole Chicken", price: 650, unit: "1.2 kg", featured: true },
    { name: "Beef - Boneless", price: 780, unit: "1 kg" },
    { name: "Fresh Tilapia", price: 450, unit: "1 kg" },
    { name: "Smokies (6 pack)", price: 300, unit: "1 pack" },
  ],
  "Bakery": [
    { name: "White Sandwich Bread", price: 65, unit: "400 g", brand: "Supa Loaf" },
    { name: "Brown Bread", price: 70, unit: "400 g" },
    { name: "Mandazi (6 pieces)", price: 100, unit: "6 pieces" },
    { name: "Chapati (4 pieces)", price: 120, unit: "4 pieces" },
  ],
  "Beverages": [
    { name: "Delmonte Orange Juice", price: 250, unit: "1 L", brand: "Delmonte" },
    { name: "Coca-Cola", price: 60, unit: "500 ml", brand: "Coca-Cola" },
    { name: "Kericho Gold Tea Bags", price: 180, unit: "100 bags", featured: true },
    { name: "Java House Ground Coffee", price: 420, unit: "250 g" },
    { name: "Mineral Water", price: 50, unit: "1 L" },
  ],
  "Pantry Staples": [
    { name: "Pembe Maize Flour", price: 190, unit: "2 kg", brand: "Pembe", featured: true },
    { name: "Basmati Rice", price: 320, unit: "2 kg" },
    { name: "Cooking Oil - Fresh Fri", price: 480, unit: "2 L", brand: "Fresh Fri", compareAtPrice: 520 },
    { name: "Brown Sugar", price: 260, unit: "2 kg" },
    { name: "Iodised Salt", price: 40, unit: "1 kg" },
    { name: "Spaghetti", price: 150, unit: "500 g" },
  ],
  "Household & Cleaning": [
    { name: "Omo Washing Powder", price: 320, unit: "1 kg", brand: "Omo" },
    { name: "Dish Washing Liquid", price: 220, unit: "750 ml" },
    { name: "Toilet Paper (4 rolls)", price: 180, unit: "4 rolls" },
    { name: "All-Purpose Cleaner", price: 260, unit: "750 ml" },
  ],
  "Personal Care": [
    { name: "Colgate Toothpaste", price: 150, unit: "150 g", brand: "Colgate" },
    { name: "Geisha Bathing Soap", price: 60, unit: "175 g", brand: "Geisha" },
    { name: "Nivea Body Lotion", price: 450, unit: "400 ml", brand: "Nivea", featured: true },
    { name: "Always Sanitary Pads", price: 180, unit: "8 pieces" },
  ],
};

// One representative photo per category, so the storefront doesn't look like every
// product is the same picture. Swap these for real product photos any time from the admin dashboard.
const categoryImages: Record<string, string> = {
  "Fresh Produce": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
  "Dairy & Eggs": "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=600&q=80",
  "Meat & Poultry": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80",
  "Bakery": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  "Beverages": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
  "Pantry Staples": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  "Household & Cleaning": "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80",
  "Personal Care": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
};
const foodPlaceholderImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";

const run = async () => {
  await connectDB();

  console.log("Clearing old data...");
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  console.log("Creating admin account...");
  await User.create({
    name: "KOKWET Admin",
    email: "admin@kokwetgroceries.co.ke",
    password: "admin1234",
    phone: "0700000000",
    role: "admin",
  });

  console.log("Creating categories...");
  const createdCategories = await Category.insertMany(
    categories.map((c) => ({ ...c, slug: slugify(c.name, { lower: true }) }))
  );

  console.log("Creating products...");
  const categoryByName = new Map(createdCategories.map((c) => [c.name, c._id]));

  const productsToInsert = Object.entries(productSeeds).flatMap(([categoryName, items]) =>
    items.map((item) => ({
      name: item.name,
      slug: slugify(item.name, { lower: true }) + "-" + Math.floor(Math.random() * 900 + 100),
      description: `Quality ${item.name.toLowerCase()} sourced fresh for KOKWET Groceries customers in Kitale.`,
      category: categoryByName.get(categoryName),
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      unit: item.unit,
      image: categoryImages[categoryName] || foodPlaceholderImage,
      images: [categoryImages[categoryName] || foodPlaceholderImage],
      stock: Math.floor(Math.random() * 80) + 20,
      brand: item.brand,
      isFeatured: !!item.featured,
    }))
  );

  await Product.insertMany(productsToInsert);

  console.log(`Done. ${createdCategories.length} categories, ${productsToInsert.length} products.`);
  console.log("Admin login -> email: admin@kokwetgroceries.co.ke | password: admin1234");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("==========================================");
console.log("ALPHA WATCH & OPTICALS - VERCEL BUILD SCRIPT");
console.log("==========================================");

// 1. Fallback DATABASE_URL if missing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/prod.db";
  console.log("ℹ️ DATABASE_URL unset. Injected fallback:", process.env.DATABASE_URL);
} else {
  console.log("ℹ️ Using DATABASE_URL:", process.env.DATABASE_URL.startsWith("file:") ? "SQLite local file" : "Remote Database");
}

// Ensure prisma directory exists
const prismaDir = path.join(__dirname, "..", "prisma");
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

function run(cmd, allowFail = false) {
  console.log(`\n▶ Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", env: process.env });
    return true;
  } catch (err) {
    if (allowFail) {
      console.warn(`⚠️ Command failed (non-fatal): ${cmd}`);
      return false;
    }
    console.error(`❌ Command failed (fatal): ${cmd}`);
    process.exit(1);
  }
}

const prismaBin = fs.existsSync(path.join(__dirname, "..", "node_modules", ".bin", "prisma"))
  ? `"${path.join(__dirname, "..", "node_modules", ".bin", "prisma")}"`
  : "npx prisma";

// 2. Prisma Generate
run(`${prismaBin} generate`);

// 3. If SQLite file database, push schema to create tables
if (process.env.DATABASE_URL.startsWith("file:")) {
  console.log("\n📦 Setting up SQLite tables for deployment...");
  run(`${prismaBin} db push --skip-generate --accept-data-loss`, true);

  // Try to seed initial catalog and admin if possible
  console.log("\n🌱 Seeding database...");
  run(`${prismaBin} db seed`, true);
}

// 4. Next.js Production Build
console.log("\n🚀 Compiling Next.js application...");
run("npx next build");

console.log("\n✅ Vercel build completed successfully!");

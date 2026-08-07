const { defineConfig } = require("prisma/config");

// ✅ CORRECT: Use process.env with fallback
// ❌ WRONG: env('DATABASE_URL') – throws error if variable is missing
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});

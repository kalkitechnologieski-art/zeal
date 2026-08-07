const { defineConfig } = require("prisma/config");

// Prisma 7 requires the URL to be defined here, not in schema.prisma
// This allows the build to pass even without DATABASE_URL set
const databaseUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});

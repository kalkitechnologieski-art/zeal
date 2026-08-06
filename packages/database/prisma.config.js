const { defineConfig, env } = require("prisma/config");
require("dotenv").config();

// Use DATABASE_URL if set, otherwise use a dummy URL for generation
const databaseUrl = env("DATABASE_URL") || "postgresql://dummy:dummy@localhost:5432/dummy";

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});

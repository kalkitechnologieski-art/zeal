import { defineConfig } from '@prisma/config'

export default defineConfig({
  // Database connection URL (required by Prisma 7)
  datasource: {
    url: process.env.DATABASE_URL,
  },
})

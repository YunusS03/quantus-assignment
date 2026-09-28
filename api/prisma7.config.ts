import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Docker Compose passes DATABASE_URL to the container, so no .env file is needed.
    url: process.env["DATABASE_URL"],
  },
});

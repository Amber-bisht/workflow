import { defineConfig } from "prisma/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:uC5uqkjsfftfLbj0@db.hkvibcdzxzcdcnksrtro.supabase.co:5432/postgres",
  },
});

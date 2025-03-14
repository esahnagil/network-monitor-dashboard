import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Check if DATABASE_URL exists in environment
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// Create a Postgres client
const client = postgres(process.env.DATABASE_URL);

// Create a Drizzle instance
export const db = drizzle(client);
import nextEnv from "@next/env";
import { database } from "../src/lib/db";

// The app creates missing tables on its first query, so this script only needs to run one query.
nextEnv.loadEnvConfig(process.cwd());
await database()("SELECT 1");
console.log("Database schema is ready. No existing results were removed.");

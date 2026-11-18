import { neon } from "@neondatabase/serverless";
import { AppError } from "./scoring";
import { SCHEMA_STATEMENTS } from "./schema";

export type Query = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
export function database(): Query {
  const url = process.env.DATABASE_URL;
  if (!url) throw new AppError(503, "Database is not configured. Connect Neon and set DATABASE_URL.");
  const sql = neon(url);
  const run: Query = async (text, params = []) => await sql.query(text, params) as Record<string, unknown>[];
  return async (text, params) => { await ensureSchema(run); return run(text, params); };
}
// Create the tables on first use in each server instance, so a fresh database needs no manual setup step.
let schemaReady: Promise<void> | undefined;
export function ensureSchema(run: Query) {
  schemaReady ??= (async () => { for (const statement of SCHEMA_STATEMENTS) await run(statement); })()
    .catch(error => { schemaReady = undefined; throw error; });
  return schemaReady;
}
export function demoMode() {
  return process.env.DEMO_MODE === "true" || (!process.env.DATABASE_URL && !process.env.VERCEL && process.env.DEMO_MODE !== "false");
}

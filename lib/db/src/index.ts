import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This ensures the sqlite.db is always in a consistent location regardless of where the process starts
const defaultSqlitePath = path.resolve(__dirname, "../sqlite.db");
const sqlitePath = process.env.DATABASE_URL || defaultSqlitePath;
const sqliteFile = path.isAbsolute(sqlitePath) ? sqlitePath : path.resolve(process.cwd(), sqlitePath);

console.log(`[DB] Loading database from: ${sqliteFile}`);

export const sqlite = new Database(sqliteFile);
export const db = drizzle(sqlite, { schema });

export * from "./schema";

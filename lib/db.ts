import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || "";

if (!connectionString) {
  console.warn('DATABASE_URL is not defined. Data persistence may fail.');
}

// Singleton SQL client
export const sql = connectionString ? neon(connectionString) : null;

// Alias for tagged-template usage in API routes: db`SELECT ...`
export const db = sql as NonNullable<typeof sql>;

export async function dbRequest<T = unknown>(query: string, params: unknown[] = []): Promise<T[]> {
  if (!sql) {
    console.warn('DB execute failed: sql client not initialized.');
    return [];
  }

  try {
    const result = await (sql as CallableFunction)(query, params);
    return Array.isArray(result) ? result : ((result as { rows?: T[] }).rows || []);
  } catch (error) {
    console.error('Unified DB Error:', error);
    throw error;
  }
}

export default sql;

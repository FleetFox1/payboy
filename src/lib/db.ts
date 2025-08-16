// --- Dev Notes ---
// Database connection utility for PayBoy platform.
// This module handles PostgreSQL connections and provides query helpers.
// You can switch to any database (MySQL, SQLite, MongoDB) by updating this file.

import { Pool } from 'pg';

// Database connection pool
let pool: Pool | null = null;

// Initialize database connection
export async function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// Helper function to execute queries with error handling
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const db = await getDb();
    const result = await db.query(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute transactions
export async function executeTransaction(queries: { query: string; params: any[] }[]) {
  const db = await getDb();
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const { query, params } of queries) {
      const result = await client.query(query, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Close database connections (useful for cleanup)
export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Health check function
export async function checkDbHealth() {
  try {
    const db = await getDb();
    const result = await db.query('SELECT NOW()');
    return { healthy: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

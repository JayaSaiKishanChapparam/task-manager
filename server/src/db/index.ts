import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  // Add some reasonable defaults for connection pooling
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection with retries
const testConnection = async (retries = MAX_RETRIES): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
    if (retries > 0) {
      console.log(
        `Retrying connection in ${
          RETRY_DELAY / 1000
        } seconds... (${retries} attempts remaining)`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return testConnection(retries - 1);
    } else {
      console.error('Failed to connect to database after multiple attempts');
      process.exit(1); // Exit if we can't connect to the database
    }
  }
};

// Add error handling for the pool itself
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

testConnection();

export { pool };

/**
 * Test Setup File
 * Runs before all tests to configure the test environment
 */

import "dotenv/config";

// Ensure DATABASE_URL is set for tests
if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  DATABASE_URL not set. Tests may fail. Using default test database URL."
  );
  process.env.DATABASE_URL =
    "postgresql://swanytello:swanytello_password@localhost:5432/swanytello?schema=public";
}

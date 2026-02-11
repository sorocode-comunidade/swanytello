import prismaInstance from "../db_operations/prismaInstance.js";
import { PrismaClient } from "../../generated/prisma/index.js";

/**
 * Database Ping Utility
 * Verifies database connection and container status at application startup
 */

interface DatabaseStatus {
  connected: boolean;
  containerRunning: boolean;
  containerHealthy: boolean;
  error?: string;
}

/**
 * Check if Docker container is running
 */
async function checkContainerStatus(): Promise<{
  running: boolean;
  healthy: boolean;
}> {
  try {
    // Try to execute a docker command to check container status
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    // Check if container exists and is running
    try {
      const { stdout } = await execAsync(
        'docker ps --filter "name=swanytello-postgres" --format "{{.Names}}:{{.Status}}"'
      );
      const isRunning = stdout.trim().includes("swanytello-postgres");

      if (!isRunning) {
        return { running: false, healthy: false };
      }

      // Check health status
      try {
        const { stdout: healthOutput } = await execAsync(
          'docker inspect swanytello-postgres --format "{{.State.Health.Status}}" 2>/dev/null || echo "no-healthcheck"'
        );
        const healthStatus = healthOutput.trim();
        const isHealthy =
          healthStatus === "healthy" || healthStatus === "no-healthcheck";

        return { running: true, healthy: isHealthy };
      } catch {
        // Health check failed, but container is running
        return { running: true, healthy: false };
      }
    } catch {
      return { running: false, healthy: false };
    }
  } catch {
    // Docker command not available or failed
    return { running: false, healthy: false };
  }
}

/**
 * Ping the database to verify connection
 */
async function pingDatabase(): Promise<{ connected: boolean; error?: string }> {
  const prisma = prismaInstance as PrismaClient;

  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check database connection and container status
 * @returns DatabaseStatus object with connection and container information
 */
export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const containerStatus = await checkContainerStatus();
  const dbConnection = await pingDatabase();

  return {
    connected: dbConnection.connected,
    containerRunning: containerStatus.running,
    containerHealthy: containerStatus.healthy,
    error: dbConnection.error,
  };
}

/**
 * Display database status to console with formatted output
 */
export async function displayDatabaseStatus(): Promise<boolean> {
  console.log("\n🔍 Checking database connection...\n");

  const status = await checkDatabaseStatus();

  // Container status
  if (status.containerRunning) {
    if (status.containerHealthy) {
      console.log("✅ Docker container: Running and healthy");
    } else {
      console.log("⚠️  Docker container: Running but health check failed");
    }
  } else {
    console.log("❌ Docker container: Not running");
    console.log(
      "   💡 Start PostgreSQL with: npm run docker:up:postgres (or: docker compose -f docker/docker-compose.yml up -d postgres)"
    );
  }

  // Database connection status
  if (status.connected) {
    console.log("✅ Database connection: Connected");
    console.log("   🎉 Ready to start application!\n");
    return true;
  } else {
    console.log("❌ Database connection: Failed");
    if (status.error) {
      console.log(`   Error: ${status.error}`);
    }
    console.log("\n   ⚠️  Application may not work correctly without database connection.\n");
    return false;
  }
}

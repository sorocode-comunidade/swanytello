import fastifyInstance from "./api/fastifyInstance.js";
import mainPublicRoutes from "./api/routes/mainPublic.routes.js";
import mainProtectedRoutes from "./api/routes/mainProtected.routes.js";
import { displayDatabaseStatus } from "./utils/dbPing.js";

/**
 * Application startup sequence
 * 1. Check database connection
 * 2. Register routes
 * 3. Start server
 */
async function startApplication() {
  // Step 1: Check database connection
  const dbConnected = await displayDatabaseStatus();

  if (!dbConnected) {
    console.warn(
      "⚠️  Warning: Database connection failed. The application will start but may not function correctly."
    );
    console.warn(
      "   Make sure PostgreSQL is running: docker compose -f docker/docker-compose.yml up -d postgres\n"
    );
  }

  // Step 2: Register routes
  fastifyInstance.register(mainPublicRoutes, { prefix: "/api" });
  fastifyInstance.register(mainProtectedRoutes, { prefix: "/api" });

  // Step 3: Start server
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || "0.0.0.0";

  fastifyInstance.listen({ port, host }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`🚀 Server listening at ${address}\n`);
  });
}

// Start the application
startApplication().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});

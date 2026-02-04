import fastifyInstance from "./api/fastifyInstance.js";
import mainPublicRoutes from "./api/routes/mainPublic.routes.js";
import mainProtectedRoutes from "./api/routes/mainProtected.routes.js";

fastifyInstance.register(mainPublicRoutes, { prefix: "/api" });
fastifyInstance.register(mainProtectedRoutes, { prefix: "/api" });

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

fastifyInstance.listen({ port, host }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

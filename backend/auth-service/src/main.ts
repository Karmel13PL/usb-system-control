import "./config/load-env.js";
import { createServer } from "node:http";

import { handleRequest } from "./app.js";
import { disconnectPrisma } from "./infrastructure/database/prisma.js";

const port = Number(process.env.PORT ?? 3001);

const server = createServer((request, response) => {
  void handleRequest(request, response);
});

server.listen(port, () => {
  console.log(`[auth-service] listening on port ${port}`);
});

async function shutdown() {
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});

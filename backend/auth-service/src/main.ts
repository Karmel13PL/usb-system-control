import { createServer } from "node:http";

import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT ?? 3001);

const server = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ status: "ok", ...app }));
});

server.listen(port, () => {
  console.log(`[auth-service] listening on port ${port}`);
});

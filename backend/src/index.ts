import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import app from "./app";
import { setupSocket } from "./socket";
import env from "./config/env";

export const prisma = new PrismaClient();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.FRONTEND_URL, credentials: true },
});

setupSocket(io);

httpServer.listen(env.PORT, () => {
  console.log(`API corriendo en http://localhost:${env.PORT}`);
  console.log(`Entorno: ${env.NODE_ENV}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

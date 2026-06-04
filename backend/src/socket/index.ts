import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";

let io: Server | null = null;

export const getIO = () => io;

export const setupSocket = (ioServer: Server) => {
  io = ioServer;

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error("Autenticación requerida"));
    try {
      const payload = verifyToken(token);
      (socket as Socket & { user?: typeof payload }).user = payload;
      next();
    } catch {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as Socket & { user?: { userId: string; role: string } }).user;
    if (!user) return;

    socket.join(`user:${user.userId}`);

    socket.on("join_order", (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    socket.on("join_business", (businessId: string) => {
      socket.join(`business:${businessId}`);
    });

    socket.on("driver_location", (data: { lat: number; lng: number; orderId: string }) => {
      io?.to(`order:${data.orderId}`).emit("driver_location", {
        lat: data.lat,
        lng: data.lng,
      });
    });

    socket.on("disconnect", () => {
      // cleanup handled by socket.io
    });
  });
};

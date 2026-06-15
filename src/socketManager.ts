import { Server } from "http";
import { Server as SocketServer } from "socket.io";

// Let TypeScript infer the default event map types naturally
let io: SocketServer;

/**
 * Initialize the Socket.io server instance
 */
export const init = (server: Server): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: "*", // Adjust this based on your frontend URL
    },
  });
  console.log("Socket Initialised!")
  return io;
};

/**
 * Retrieve the active instance anywhere in your project
 */
export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};

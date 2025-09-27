import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
export const app = express();
export const httpServer = createServer(app);
import { createClient } from "redis";

import { createAdapter } from "@socket.io/redis-adapter";

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();
console.log("Connected to Redis");

io.adapter(createAdapter(pubClient, subClient));

pubClient.on("error", (err) => console.log("Redis Client Error", err));

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log("a user connected: " + userId);
  if (!userId) socket.disconnect();
  pubClient.hSet(
    "onlineUsers",
    userId,
    JSON.stringify({ socketId: socket.id })
  );

  socket.on("EndConnection", (data) => {
    console.log("EndConnection event received:", data); // Log the data for debugging
    // Handle any necessary cleanup here, such as removing the user from the online list
    pubClient.hDel("onlineUsers", userId); // Example cleanup
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected: " + userId);
    pubClient.hDel("onlineUsers", userId);
  });
});

export default pubClient;

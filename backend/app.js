import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
export const app = express();
export const httpServer = createServer(app);
import { createClient } from "redis";

import { createAdapter } from "@socket.io/redis-adapter";
import Conversation from "./models/conversatoin.model.js";

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

subClient.subscribe("userChat", async (data) => {
  const { message, projectId } = JSON.parse(data);
  if (!projectId) return;
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { projectId },
      {
        $push: {
          messages: {
            role: "user",
            text: message,
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    console.log("saved user message to database successfully:", conversation);
  } catch (error) {
    const ErrorQueueData = {
      payload: JSON.parse(data),
      reason: "userChat",
      retrievalCount: 0,
    };
    console.log(error, "pushing to error queue");
    pubClient.rPush("errorQueue", JSON.stringify(ErrorQueueData));
  }
});
subClient.subscribe("smallLLMResponse", async (data) => {
  const { message, projectId } = JSON.parse(data);
  if (!projectId) return;
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { projectId },
      {
        $push: {
          messages: {
            role: "system",
            text: message,
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    console.log("saved user message to database successfully:", conversation);
  } catch (error) {
    const ErrorQueueData = {
      payload: JSON.parse(data),
      reason: "smallLLMResponse",
      retrievalCount: 0,
    };
    console.log(error, "pushing to error queue");
    pubClient.rPush("errorQueue", JSON.stringify(ErrorQueueData));
  }
});

export default pubClient;

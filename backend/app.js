import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();
export const app = express();
export const httpServer = createServer(app);
import { createClient } from "redis";

import { createAdapter } from "@socket.io/redis-adapter";
import Conversation from "./models/conversatoin.model.js";
import SchemaVersion from "./models/schema.model.js";
import Usage from "./models/usage.model.js";

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
  try {
    const { message, projectId } = JSON.parse(data);
    if (!projectId) return;
    const conversation = await Conversation.findOneAndUpdate(
      { projectId },
      {
        $push: {
          messages: {
            sender: "user",
            text: message,
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (error) {
    const ErrorQueueData = {
      payload: JSON.parse(data),
      reason: "userChat",
      retrievalCount: 0,
    };
    pubClient.rPush("errorQueue", JSON.stringify(ErrorQueueData));
  }
});
subClient.subscribe("smallLLMResponse", async (data) => {
  try {
    const { message, projectId } = JSON.parse(data);
    if (!projectId) return;
    const conversation = await Conversation.findOneAndUpdate(
      { projectId },
      {
        $push: {
          messages: {
            sender: "system",
            text: message,
          },
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (error) {
    const ErrorQueueData = {
      payload: JSON.parse(data),
      reason: "smallLLMResponse",
      retrievalCount: 0,
    };
    pubClient.rPush("errorQueue", JSON.stringify(ErrorQueueData));
  }
});

subClient.subscribe("fullLLMResponse", async (res) => {
  try {
    const { data, projectId, userId } = JSON.parse(res);
    if (!projectId || !userId) return;
    var isInitialFailed = true;
    var isFinalFailed = true;
    if (data?.initialResponse) {
      pubClient.publish(
        "smallLLMResponse",
        JSON.stringify({
          message: data?.initialResponse,
          projectId,
        })
      );
      isInitialFailed = false;
    }
    if (data?.finalExplanation) {
      pubClient.publish(
        "smallLLMResponse",
        JSON.stringify({
          message: data?.finalExplanation,
          projectId,
        })
      );
      isFinalFailed = false;
    }
    if (data?.entities && data?.relationships) {
      const nodes = data?.entities.map((t) => ({
        id: t.name.toLowerCase(),
        position: t.pos,
        data: {
          title: t?.name,
          fields: t?.fields,
          code: t?.code?.length ? t.code : null,
          id: t.name.toLowerCase(),
          description: t?.description ? t.description : null,
        },
      }));
      let edges = data?.relationships.map((t) => ({
        id: uuidv4(),
        source: t?.source.toLowerCase(),
        target: t?.target.toLowerCase(),
        data: { type: t?.type, description: t?.description },
      }));

      pubClient.publish(
        "nodesAndEdges",
        JSON.stringify({ nodes, edges, projectId, userId })
      );
    }
  } catch (error) {
    if (isInitialFailed) {
      const { data, projectId, userId } = JSON.parse(res);
      const ErrorQueueData = {
        payload: { message: data?.initialResponse, projectId },
        reason: "smallLLMResponse",
        retrievalCount: 0,
      };
      pubClient.rPush("errorQueue", JSON.stringify(ErrorQueueData));
    }
    if (isFinalFailed) {
      const { data, projectId, userId } = JSON.parse(res);
      const ErrorQueueData = {
        payload: { message: data?.finalExplanation, projectId },
        reason: "smallLLMResponse",
        retrievalCount: 0,
      };
      pubClient.rPush("errorQueue", JSON.stringify(ErrorQueueData));
    }
  }
});

subClient.subscribe("nodesAndEdges", async (data) => {
  const { nodes, edges, projectId, userId } = JSON.parse(data);
  if (!projectId || !userId || !nodes || !edges) return;
  try {
    await SchemaVersion.findOneAndUpdate(
      {
        projectId,
      },
      {
        $set: {
          nodes: nodes,
          edges: edges,
          ownerId: userId,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (error) {
    const ErrorQueueData = {
      payload: JSON.parse(data),
      reason: "nodesAndEdges",
      retrievalCount: 0,
    };
    pubClient.rPush("errorQueue", JSON.stringify(ErrorQueueData));
  }
});

subClient.subscribe("token", async (data) => {
  try {
    console.log("reciving tokne requrest");

    const { projectId, userId, promptTokens, totalTokens, completionTokens } =
      JSON.parse(data);
    if (
      (!projectId || !userId || !promptTokens, !totalTokens, !completionTokens)
    )
      return;
    const usage = await Usage.findOne({ projectId });
    if (!usage) {
      usage = await Usage.create({
        projectId,
        ownerId: userId,
        promptTokens,
        totalTokens,
        completionTokens,
      });
    }
    usage.promptTokens += promptTokens;
    usage.totalTokens += totalTokens;
    usage.completionTokens += completionTokens;
    await usage.save();
  } catch (error) {
    const ErrorQueueData = {
      payload: JSON.parse(data),
      reason: "token",
      retrievalCount: 0,
    };
    pubClient.rPush("errorQueue", JSON.stringify(ErrorQueueData));
  }
});
export default pubClient;

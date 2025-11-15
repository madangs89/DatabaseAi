import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./db/connectDB.js";
import llmRouter from "./routes/lll.routes.js";
import pubClient, { app, httpServer } from "./app.js";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import Conversation from "./models/conversatoin.model.js";
import SchemaVersion from "./models/schema.model.js";
import Usage from "./models/usage.model.js";
import schemaRouter from "./routes/schema.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import repoRouter from "./routes/repo.router.js";
import shareRouter from "./routes/share.routes.js";
import usageRouter from "./routes/usage.router.js";
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ limit: "10mb", extended: true }));


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/", llmRouter);
app.use("/auth", authRouter);
app.use("/project", projectRouter);
app.use("/schema", schemaRouter);
app.use("/conversation", conversationRouter);
app.use("/repo", repoRouter);
app.use("/share", shareRouter);
app.use("/usage", usageRouter);

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT SECRET:", process.env.GOOGLE_CLIENT_SECRET);

const processErrorHandler = async () => {
  while (true) {
    let res;
    try {
      let res = await pubClient.lPop("errorQueue");
      if (!res) {
        await sleep(1000);
        continue;
      }
      const { payload, reason, retrievalCount } = JSON.parse(res);
      console.log("Process handler called for :", reason);

      if (retrievalCount > 3) {
        console.warn("Max retries reached, skipping message:", payload);
        continue;
      }

      if (reason === "userChat") {
        const { projectId, message } = payload;
        if (!projectId) continue;

        await Conversation.findOneAndUpdate(
          { projectId },
          { $push: { messages: { sender: "user", text: message } } },
          { upsert: true, new: true }
        );

        console.log("Processed failed message successfully:", payload);
      }
      if (reason === "smallLLMResponse") {
        const { projectId, message } = payload;
        if (!projectId) continue;

        await Conversation.findOneAndUpdate(
          { projectId },
          { $push: { messages: { sender: "system", text: message } } },
          { upsert: true, new: true }
        );
      }

      if (reason == "nodesAndEdges") {
        const { projectId, nodes, edges, userId, dbConvKey } = payload;
        if (!projectId || !userId || !nodes || !edges) continue;
        await SchemaVersion.findOneAndUpdate(
          {
            projectId,
          },
          {
            $set: {
              nodes: nodes,
              edges: edges,
              ownerId: userId,
              dbConvKey: dbConvKey,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
      }
      if (reason == "token") {
        const {
          projectId,
          userId,
          promptTokens,
          totalTokens,
          completionTokens,
        } = payload;
        if (!projectId || !userId || !promptTokens || !totalTokens) continue;
        let usage = await Usage.findOne({ projectId });
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
      }
    } catch (error) {
      if (res) {
        const failedData = JSON.parse(res);
        const ErrorQueueData = {
          payload: failedData.payload || null,
          reason: failedData.reason || "unknown",
          retrievalCount: (failedData.retrievalCount || 0) + 1,
        };
        await pubClient.rPush("errorQueue", JSON.stringify(ErrorQueueData));
      }
      await sleep(1000);
    }
  }
};

// Connect DB first
httpServer.listen(process.env.PORT || 5000, async () => {
  await connectDb();
  processErrorHandler();
  console.log(
    `Server is running on port http://localhost:${process.env.PORT || 5000}`
  );
});

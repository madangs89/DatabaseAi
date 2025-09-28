import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./db/connectDB.js";
import llmRouter from "./routes/lll.routes.js";
import { app, httpServer } from "./app.js";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/", llmRouter);
app.use("/auth", authRouter);
app.use("/project", projectRouter);

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT SECRET:", process.env.GOOGLE_CLIENT_SECRET);

// Connect DB first
httpServer.listen(process.env.PORT || 5000, async () => {
  await connectDb();
  console.log(
    `Server is running on port http://localhost:${process.env.PORT || 5000}`
  );
});

import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./db/connectDB.js";
import llmRouter from "./routes/lll.routes.js";
import { app, httpServer } from "./app.js";
import express from "express";

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/", llmRouter);

// Connect DB first
httpServer.listen(process.env.PORT || 5000, async () => {
  await connectDb();
  console.log(
    `Server is running on port http://localhost:${process.env.PORT || 5000}`
  );
});

import express from "express";
import { createDBWithLlmCall } from "../controlers/llm.controler.js";

const llmRouter = express.Router();

llmRouter.post("/create-db", createDBWithLlmCall);

export default llmRouter;
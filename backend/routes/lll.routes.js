import express from "express";
import {
  createDBWithLlmCall,
  PromptGenerator,
  suggestionModel,
} from "../controlers/llm.controler.js";
import { authMiddleware } from "../middelware/auth.middelware.js";

const llmRouter = express.Router();

llmRouter.post("/create-db", authMiddleware, createDBWithLlmCall);
llmRouter.post("/suggestions", authMiddleware, suggestionModel);
llmRouter.post("/prompt", authMiddleware, PromptGenerator);

export default llmRouter;

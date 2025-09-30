import express from "express";
import {
  createDBWithLlmCall,
  PromptGenerator,
  suggestionModel,
} from "../controlers/llm.controler.js";
import { authMiddleware } from "../middelware/auth.middelware.js";
import { getApiCodes } from "../utils/lll.service.js";

const llmRouter = express.Router();

llmRouter.post("/create-db", authMiddleware, createDBWithLlmCall);
llmRouter.post("/suggestions", authMiddleware, suggestionModel);
llmRouter.post("/prompt", authMiddleware, PromptGenerator);
llmRouter.post("/b", getApiCodes);

export default llmRouter;

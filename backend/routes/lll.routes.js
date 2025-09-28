import express from "express";
import {
  createDBWithLlmCall,
  PromptGenerator,
  suggestionModel,
} from "../controlers/llm.controler.js";

const llmRouter = express.Router();

llmRouter.post("/create-db", createDBWithLlmCall);
llmRouter.post("/suggestions", suggestionModel);
llmRouter.post("/prompt", PromptGenerator);

export default llmRouter;

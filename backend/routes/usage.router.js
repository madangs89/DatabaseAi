import express from "express";
import { getTotalTokenUsage } from "../controlers/usage.controler.js";
import { authMiddleware } from "../middelware/auth.middelware.js";

const usageRouter = express.Router();


usageRouter.get("/" ,authMiddleware, getTotalTokenUsage)

export default usageRouter;

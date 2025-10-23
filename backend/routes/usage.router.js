import express from "express";
import { getTotalTokenUsage } from "../controlers/usage.controler.js";

const usageRouter = express.Router();


usageRouter.get("/" , getTotalTokenUsage)

export default usageRouter;

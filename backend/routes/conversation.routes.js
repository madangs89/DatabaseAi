import express from "express";

import { getPaginatedMessages } from "../controlers/conversataion.controler.js";

const conversationRouter = express.Router();

conversationRouter.get("/chat/:projectId", getPaginatedMessages);
export default conversationRouter;

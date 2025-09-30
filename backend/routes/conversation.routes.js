import express from "express";

import { getPaginatedMessages } from "../controlers/conversataion.controler.js";

const conversationRouter = express.Router();

conversationRouter.get("/:projectId", getPaginatedMessages);
export default conversationRouter;

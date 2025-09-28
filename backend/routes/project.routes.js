import express from "express";
import { authMiddleware } from "../middelware/auth.middelware.js";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../controlers/project.controler.js";

const projectRouter = express.Router();

// Routes
projectRouter.post("/", authMiddleware, createProject); // Create project
projectRouter.get("/", authMiddleware, getProjects); // Get all projects for user
projectRouter.get("/:id", getProjectById); // Get single project
projectRouter.put("/:id", authMiddleware, updateProject); // Update project
projectRouter.delete("/:id", authMiddleware, deleteProject); // Delete project

export default projectRouter;

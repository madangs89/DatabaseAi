import {
  createRepo,
  getRepoCommitHistory,
  handleGitLogout,
  isGitAuth,
  isRepoCreatedForProjectId,
  pushCodeToGitRepo,
} from "../controlers/repo.controler.js";
import { gitMiddleware } from "../middelware/git.middelware.js";
import express from "express";

const repoRouter = express.Router();

repoRouter.get("/is-git-auth", gitMiddleware, isGitAuth);
repoRouter.post("/git-logout", gitMiddleware, handleGitLogout);
repoRouter.post("/create-repo", gitMiddleware, createRepo);
repoRouter.post("/push-code", gitMiddleware, pushCodeToGitRepo);
repoRouter.get("/commits/:projectId/:repoName", gitMiddleware, getRepoCommitHistory);
repoRouter.get(
  "/is-repo-created/:projectId",
  gitMiddleware,
  isRepoCreatedForProjectId
);

export default repoRouter;

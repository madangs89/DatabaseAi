import User from "../models/user.model.js";
import axios from "axios";
import { decrypt } from "../utils/helpers.service.js";
import Repo from "../models/repos.model.js";

export const isGitAuth = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Unauthorized", success: false });
    return res.json({
      user,
      success: true,
      message: "User found successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Server error", success: false });
  }
};

export const handleGitLogout = async (req, res) => {
  try {
    res.clearCookie("gitToken", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const createRepo = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const userDetails = await User.findById(user._id);
    if (!userDetails) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    let { gitAccessToken } = userDetails;
    if (!gitAccessToken) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    gitAccessToken = decrypt(gitAccessToken);
    console.log(gitAccessToken);

    const {
      repoName,
      description,
      visibility,
      addGitignore,
      addLicense,
      projectId,
    } = req.body;

    if (!repoName) {
      return res.status(400).json({ message: "Repository name is required" });
    }

    const data = {
      name: repoName,
      description,
      private: visibility == "private",
      auto_init: true,
    };
    if (addGitignore) data.gitignore_template = "Node";
    if (addLicense) data.license_template = "mit";
    const headers = {
      Authorization: `Bearer ${gitAccessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Schema Genius",
    };

    const userRepos = await axios.get(
      "https://api.github.com/user/repos?per_page=100",
      {
        headers,
      }
    );
    const repoExists = userRepos?.data?.some(
      (r) => r.name.toLowerCase() === repoName.toLowerCase()
    );

    if (repoExists) {
      return res
        .status(400)
        .json({ message: "Repository name already exists", success: false });
    }
    const result = await axios.post("https://api.github.com/user/repos", data, {
      headers,
    });

    if (result?.data?.name) {
      await Repo.create({
        projectId,
        repoUrl: result?.data?.html_url,
        repoName: result?.data?.name,
        owner: user._id,
      });
      return res.json({
        message: "Repository created successfully",
        success: true,
        data: {
          projectId,
          repoUrl: result?.data?.html_url,
          repoName: result?.data?.name,
          owner: user._id,
        },
      });
    }
  } catch (error) {
    console.error(error);
    if (
      error.response &&
      error.response.status === 422 &&
      error.response.data?.errors?.some((e) =>
        e.message?.toLowerCase().includes("name already exists")
      )
    ) {
      return res.status(400).json({
        message: "Repository name already exists on GitHub",
        success: false,
      });
    }
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const isRepoCreatedForProjectId = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) {
      return res.json({
        success: false,
        data: { isThere: false, repo: null },
        message: "Project id is required",
      });
    }
    const repo = await Repo.findOne({ projectId });

    if (repo) {
      const data = {
        repo,
        isThere: true,
      };
      return res.json({ success: true, data, message: "Repo found" });
    }
    return res.json({
      success: false,
      data: {
        isThere: false,
        repo: null,
      },
      message: "Repo not found",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      data: { isThere: false, repo: null },
    });
  }
};

export const pushCodeToGitRepo = async (req, res) => {
  try {
    const user = req.user;
    if (!user._id) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const { tree, projectId, commitMessage, repoName } = req.body;

    const userDetails = await User.findById(user._id);
    if (!userDetails) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    let { gitAccessToken, gitUserName } = userDetails;
    if (!gitAccessToken) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    gitAccessToken = decrypt(gitAccessToken);
    console.log(gitAccessToken);

    if (tree.length == 0 || !projectId || !commitMessage || !repoName) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    let pushedFilesCount = 0;
    let failedFiles = [];
    const handleRecursion = async (tree) => {
      for (const node of tree) {
        if (node.type === "file") {
          let sha = null;
          let bothSame = false;
          try {
            const result = await axios.get(
              `https://api.github.com/repos/${gitUserName}/${repoName}/contents/${node.id}?ref=main`,
              {
                headers: {
                  Authorization: `Bearer ${gitAccessToken}`,
                },
              }
            );
            sha = result.data.sha;
            try {
              const decodedContent = atob(result.data.content);
              bothSame = decodedContent === node.content;
            } catch {
              bothSame = false; // if decode fails, force update
            }
          } catch {
            sha = null; // file doesn't exist, will create
          }
          if (!bothSame) {
            try {
              const pushResult = await axios.put(
                `https://api.github.com/repos/${gitUserName}/${repoName}/contents/${node.id}`,
                {
                  message: commitMessage,
                  content: btoa(node.content), // base64 encode
                  branch: "main",
                  sha: sha || undefined,
                },
                {
                  headers: {
                    Authorization: `Bearer ${gitAccessToken}`,
                  },
                }
              );

              console.log("successfully pushed :", node.id);

              console.log(pushResult);
              pushedFilesCount++;
            } catch (error) {
              failedFiles.push(node);
              console.error(
                "failed while pushing",
                error.response?.data || error.message
              );
            }
          }
        } else if (node.type === "folder" && node.children) {
          await handleRecursion(node.children);
        }
      }
    };
    await handleRecursion(tree);
    if (failedFiles.length > 0) {
      const retryList = [...failedFiles];
      failedFiles = []; // reset before retry
      await handleRecursion(retryList);
    }
    const repo = await Repo.findOne({ projectId, repoName });
    if (repo) {
      repo.history.push({
        commitMessage,
        pushedAt: new Date(),
        totalFiles: pushedFilesCount,
        repoBranch: "main",
        status: "success",
      });
      await repo.save();
    }

    return res.json({
      message: "Code pushed successfully",
      data: repo,
      success: true,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    try {
      const { projectId, repoName, commitMessage } = req.body;
      const repo = await Repo.findOne({ projectId, repoName });
      if (repo) {
        repo.history.push({
          commitMessage: commitMessage || "Unknown commit",
          pushedAt: new Date(),
          repoBranch: "main",
          status: "failed",
          errorMessage: error.response?.data?.message || error.message,
        });
        await repo.save();
      }
    } catch (logError) {
      console.error("Failed to log push history:", logError.message);
    }
    return res
      .status(500)
      .json({ message: "Error pushing code", success: false });
  }
};

export const getRepoCommitHistory = async (req, res) => {
  try {
    const { projectId, repoName } = req.params;
    const repo = await Repo.findOne({ projectId, repoName });
    if (!repo) {
      return res
        .status(404)
        .json({ message: "Repo not found", success: false });
    }
    return res.json({ message: "Repo found", success: true, data: repo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

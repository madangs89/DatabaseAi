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
    res.clearCookie("gitToken", { httpOnly: true, sameSite: "lax" });
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

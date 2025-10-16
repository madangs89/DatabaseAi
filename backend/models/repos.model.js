import mongoose from "mongoose";

const pushHistorySchema = new mongoose.Schema(
  {
    commitMessage: { type: String, required: true },
    pushedAt: { type: Date, default: Date.now },
    totalFiles: { type: Number, default: 0 },
    repoBranch: { type: String, default: "main" },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    errorMessage: { type: String },
  },
  { _id: false }
);
const repoSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },
    repoUrl: {
      type: String,
      required: true,
    },
    repoName: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    history: [pushHistorySchema],
  },
  { timestamps: true }
);
const Repo = mongoose.model("Repo", repoSchema);

export default Repo;

import mongoose from "mongoose";
const UsageSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  promptTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Usage = mongoose.model("Usage", UsageSchema);

export default Usage;

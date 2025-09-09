import mongoose from "mongoose";
const UsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  promptTokens: Number,
  completionTokens: Number,
  costUsd: Number,
  createdAt: { type: Date, default: Date.now }
});
const Usage = mongoose.model('Usage', UsageSchema);

export default Usage;

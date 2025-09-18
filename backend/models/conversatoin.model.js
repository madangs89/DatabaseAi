import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    text: { type: String, required: true }, // human-readable
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);
const ConversationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    index: true,
  },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;

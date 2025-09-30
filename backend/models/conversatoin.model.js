import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    text: { type: String, required: true }, // human-readable
  },
  { _id: false, timestamps: true }
);
const ConversationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;

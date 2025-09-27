import mongoose from "mongoose";

const OAuthProviderSchema = new mongoose.Schema(
  {
    provider: String,
    providerId: String,
  },
  { _id: false }
);
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, index: true },
  hashedPassword: String,
  avatarUrl: String,
  oauthProviders: [OAuthProviderSchema],
  plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
  createdAt: { type: Date, default: Date.now },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    default: null,
    index: true,
  },
  updatedAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", UserSchema);

export default User;

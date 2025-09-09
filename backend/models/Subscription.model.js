import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link to user
  plan: { type: String, enum: ["free", "pro", "enterprise"], required: true },
  status: { type: String, enum: ["active", "canceled", "past_due", "not_active"], default: "not_active" },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update `updatedAt` on save
SubscriptionSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;

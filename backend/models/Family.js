const mongoose = require("mongoose");

const FamilyMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    nickname: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ["owner", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["active"],
      default: "active",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const FamilySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [FamilyMemberSchema],
      default: [],
    },
  },
  { timestamps: true }
);

FamilySchema.index({ ownerId: 1 });
FamilySchema.index({ "members.userId": 1 });

module.exports = mongoose.model("Family", FamilySchema);

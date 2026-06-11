const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["THUNHAP", "CHITIEU"], required: true },
    note: { type: String },
    date: { type: Date, default: Date.now },
    icon: { type: String },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);

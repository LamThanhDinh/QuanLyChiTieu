const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true }, // Tên tài khoản: "Ví tay", "Thẻ Techcombank"
  type: { type: String, enum: ["TIENMAT", "THENGANHANG"], required: true },
  initialBalance: { type: Number, default: 0 },
  bankName: { type: String, default: "" }, // Ví dụ: Vietcombank
  accountNumber: { type: String, default: "" }, // Ví dụ: 123456789
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Account", AccountSchema);

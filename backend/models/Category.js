const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["THUNHAP", "CHITIEU"],
      required: true,
    },
    icon: {
      type: String,
      default: "fa-question-circle", //  icon mặc định nếu không chọn
    },
    //  Thêm trường để đánh dấu category của goal
    isGoalCategory: {
      type: Boolean,
      default: false,
    },
    //  Thêm trường để liên kết với goal
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);

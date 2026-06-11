const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên mục tiêu"],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, "Vui lòng nhập số tiền mục tiêu"],
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    icon: {
      type: String,
      default: "🎯",
    },
    archived: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//  Middleware để tự động cập nhật status khi save
goalSchema.pre("save", function (next) {
  // Auto-update status based on progress
  if (this.currentAmount >= this.targetAmount) {
    this.status = "completed";
  } else {
    this.status = "in-progress";
  }
  next();
});

//  Middleware để tự động cập nhật status khi findOneAndUpdate
goalSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function (next) {
    const update = this.getUpdate();

    // Nếu có update currentAmount hoặc targetAmount
    if (
      update.$set &&
      (update.$set.currentAmount !== undefined ||
        update.$set.targetAmount !== undefined)
    ) {
      // Lấy goal hiện tại để so sánh
      this.model
        .findOne(this.getQuery())
        .then((goal) => {
          if (goal) {
            const newCurrentAmount =
              update.$set.currentAmount !== undefined
                ? update.$set.currentAmount
                : goal.currentAmount;
            const newTargetAmount =
              update.$set.targetAmount !== undefined
                ? update.$set.targetAmount
                : goal.targetAmount;

            if (newCurrentAmount >= newTargetAmount) {
              update.$set.status = "completed";
            } else {
              update.$set.status = "in-progress";
            }
          }
          next();
        })
        .catch(next);
    } else {
      next();
    }
  }
);

module.exports = mongoose.model("Goal", goalSchema);

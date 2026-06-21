const asyncHandler = require("express-async-handler");
const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction"); // Import model Transaction
const Category = require("../models/Category");
const Account = require("../models/Account");

// ✅ HELPER FUNCTION: TÌM HOẶC TẠO CATEGORY CHO GOAL
const findOrCreateGoalCategory = async (goal, userId) => {
  const categoryName = goal.name; // Bỏ emoji 💰, chỉ dùng tên goal
  let goalCategory = await Category.findOne({
    name: categoryName,
    userId: userId,
    isGoalCategory: true, // Thêm điều kiện này để tránh trùng với category thường
  });

  if (!goalCategory) {
    goalCategory = await Category.create({
      name: categoryName,
      type: "CHITIEU",
      userId: userId,
      icon: "fa-bullseye", // Set icon mặc định cho goal category
      isGoalCategory: true,
      goalId: goal._id,
    });
  } else {
    // Cập nhật icon nếu category đã tồn tại nhưng chưa có icon hoặc có icon mặc định
    if (!goalCategory.icon || goalCategory.icon === "fa-question-circle") {
      goalCategory.icon = "fa-bullseye";
      await goalCategory.save();
    }
  }

  return goalCategory;
};

// @desc    Lấy tất cả mục tiêu của người dùng
// @route   GET /api/goals
// @access  Private
// trong file backend/controllers/goalController.js

const getGoals = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    filter,
    sortType = "CREATED",
    sortDirection = "desc",
  } = req.query;

  const query = {
    user: req.user.id,
    archived: false,
  };

  // Sửa đoạn này: so sánh filter chữ hoa
  if (filter && filter.toUpperCase() === "ARCHIVED") {
    query.archived = true;
  } else if (filter && filter.toUpperCase() === "ALL") {
    delete query.archived;
  }

  // ✅ Xây dựng đối tượng sắp xếp động
  const sort = { isPinned: -1 }; // Luôn ưu tiên mục được ghim
  if (sortType === "PROGRESS") {
    // Sắp xếp theo tiến độ cần logic phức tạp hơn, có thể cần aggregation
    // Tạm thời sắp xếp theo ngày tạo
    sort.createdAt = sortDirection === "desc" ? -1 : 1;
  } else if (sortType === "DEADLINE") {
    sort.deadline = sortDirection === "desc" ? -1 : 1;
  } else {
    // Mặc định là 'CREATED'
    sort.createdAt = sortDirection === "desc" ? -1 : 1;
  }

  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const total = await Goal.countDocuments(query);

  const goals = await Goal.find(query)
    .sort(sort) //  Sử dụng đối tượng sort động
    .limit(parseInt(limit))
    .skip(startIndex);

  res.status(200).json({
    data: goals,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalGoals: total,
  });
});
// @desc    Tạo mục tiêu mới
// @route   POST /api/goals
// @access  Private
const createGoal = asyncHandler(async (req, res) => {
  const { name, targetAmount, deadline, icon } = req.body;

  if (!name || !targetAmount) {
    res.status(400);
    throw new Error("Tên và Số tiền mục tiêu là bắt buộc");
  }

  const goal = await Goal.create({
    user: req.user.id,
    name,
    targetAmount,
    deadline,
    icon: icon || "🎯", // Icon mặc định emoji đẹp cho mục tiêu
    currentAmount: 0, //  Đảm bảo currentAmount được set
    status: "in-progress", //  Đảm bảo status được set
    isPinned: false, //  Đảm bảo isPinned được set
    archived: false, //  Đảm bảo archived được set
  });

  res.status(201).json(goal);
});

// @desc    Cập nhật mục tiêu
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error("Không tìm thấy mục tiêu");
  }

  // Đảm bảo người dùng chỉ cập nhật mục tiêu của chính mình
  if (goal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Không được phép");
  }

  // ✅ CẬP NHẬT CATEGORY NẾU TÊN GOAL THAY ĐỔI
  const oldCategoryName = goal.name; // Bỏ emoji 💰
  const newName = req.body.name;

  if (newName && newName !== goal.name) {
    const newCategoryName = newName; // Bỏ emoji 💰
    await Category.findOneAndUpdate(
      {
        name: oldCategoryName,
        userId: req.user.id,
        isGoalCategory: true,
        goalId: goal._id,
      },
      {
        name: newCategoryName,
        icon: "fa-bullseye", // Đảm bảo icon được set khi update
      }
    );
  }

  // ✅ Prepare update data with validation
  const updateData = {
    ...(req.body.name && { name: req.body.name }),
    ...(req.body.targetAmount && { targetAmount: req.body.targetAmount }),
    ...(req.body.deadline !== undefined && { deadline: req.body.deadline }),
    ...(req.body.icon && { icon: req.body.icon }),
    ...(req.body.currentAmount !== undefined && {
      currentAmount: req.body.currentAmount,
    }),
    ...(req.body.isPinned !== undefined && { isPinned: req.body.isPinned }),
    ...(req.body.archived !== undefined && { archived: req.body.archived }),
    ...(req.body.status && { status: req.body.status }),
  };

  // ✅ Auto-update status based on currentAmount vs targetAmount
  if (
    updateData.currentAmount !== undefined ||
    updateData.targetAmount !== undefined
  ) {
    const currentAmount =
      updateData.currentAmount !== undefined
        ? updateData.currentAmount
        : goal.currentAmount;
    const targetAmount =
      updateData.targetAmount !== undefined
        ? updateData.targetAmount
        : goal.targetAmount;
    updateData.status =
      currentAmount >= targetAmount ? "completed" : "in-progress";
  }

  const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, updateData, {
    new: true, // Trả về document đã được cập nhật
    runValidators: true, //  Run validation on update
  });

  res.status(200).json(updatedGoal);
});

// @desc    Xóa mục tiêu
// @route   DELETE /api/goals/:id
// @access  Private

const deleteGoal = asyncHandler(async (req, res) => {
  // Sử dụng findOneAndDelete để tìm và xóa trong một bước,
  // đồng thời kiểm tra quyền sở hữu (user: req.user.id)
  const goal = await Goal.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  // Nếu không tìm thấy mục tiêu nào khớp với ID và user ID,
  // có nghĩa là mục tiêu không tồn tại hoặc người dùng không có quyền.
  if (!goal) {
    res.status(404);
    throw new Error("Không tìm thấy mục tiêu hoặc bạn không có quyền xóa");
  }

  // ✅ DỌN DẸP CATEGORY LIÊN QUAN ĐẾN GOAL (NẾU CÓ)
  const categoryName = goal.name; // Bỏ emoji 
  await Category.findOneAndDelete({
    name: categoryName,
    userId: req.user.id,
    isGoalCategory: true,
    goalId: goal._id,
  });

  // Nếu xóa thành công, trả về id đã xóa
  res.status(200).json({ id: req.params.id });
});

// @desc    Nạp tiền vào mục tiêu
// @route   POST /api/goals/:id/add-funds
// @access  Private
const addFundsToGoal = asyncHandler(async (req, res) => {
  const { amount, accountId } = req.body;
  const goalId = req.params.id;

  if (!amount || amount <= 0 || !accountId) {
    res.status(400);
    throw new Error("Vui lòng nhập số tiền và chọn tài khoản nguồn hợp lệ");
  }

  const account = await Account.findById(accountId);
  if (!account || account.userId.toString() !== req.user.id) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản nguồn.");
  }
  if (account.balance < amount) {
    res.status(400);
    throw new Error(
      "Số dư trong tài khoản không đủ để thực hiện giao dịch này."
    );
  }

  const goal = await Goal.findById(goalId);
  // ✅ THÊM LẠI CÁC CHECK BỊ THIẾU
  if (!goal) {
    res.status(404);
    throw new Error("Không tìm thấy mục tiêu");
  }
  if (goal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Không được phép truy cập mục tiêu này");
  }

  // ✅ 2. TÌM HOẶC TẠO CATEGORY CHO GOAL
  const goalCategory = await findOrCreateGoalCategory(goal, req.user.id);

  // ✅ 3. TẠO TRANSACTION VỚI THÔNG TIN CHI TIẾT VÀ DỄ HIỂU
  const currentProgress = (
    ((goal.currentAmount + Number(amount)) / goal.targetAmount) *
    100
  ).toFixed(1);
  const transaction = await Transaction.create({
    userId: req.user.id,
    type: "CHITIEU",
    name: `Tiết kiệm: ${goal.name}`,
    amount: Number(amount),
    date: new Date(),
    accountId: accountId,
    categoryId: goalCategory._id,
    note: `💰 Nạp ${Number(amount).toLocaleString(
      "vi-VN"
    )}đ | Tiến độ: ${currentProgress}% (${(
      goal.currentAmount + Number(amount)
    ).toLocaleString("vi-VN")}đ/${goal.targetAmount.toLocaleString("vi-VN")}đ)`,
    // Không set icon cho transaction, để frontend sử dụng icon mặc định
    goalId: goal._id,
  });

  // ... phần cập nhật goal giữ nguyên ...
  goal.currentAmount += Number(amount);
  if (goal.currentAmount >= goal.targetAmount) {
    goal.status = "completed";
  }
  const updatedGoal = await goal.save();

  account.balance -= Number(amount);
  await account.save();
  res.status(200).json({ updatedGoal, transaction });
});

// @desc    Đổi trạng thái archived của mục tiêu
// @route   PATCH /api/goals/:id/archive
// @access  Private
const toggleArchiveGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) {
    res.status(404);
    throw new Error("Không tìm thấy mục tiêu");
  }
  if (goal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Không được phép");
  }
  goal.archived = !goal.archived;
  await goal.save();
  res.status(200).json(goal);
});

// @desc    Đổi trạng thái isPinned của mục tiêu
// @route   PATCH /api/goals/:id/pin
// @access  Private
const togglePinGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) {
    res.status(404);
    throw new Error("Không tìm thấy mục tiêu");
  }
  if (goal.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Không được phép");
  }
  goal.isPinned = !goal.isPinned;
  await goal.save();
  res.status(200).json(goal);
});

// @desc    Fix icon cho các goal categories hiện tại
// @route   PATCH /api/goals/fix-categories-icon
// @access  Private
const fixGoalCategoriesIcon = asyncHandler(async (req, res) => {
  try {
    // Tìm tất cả goal categories của user hiện tại
    const goalCategories = await Category.find({
      userId: req.user.id,
      isGoalCategory: true,
    });

    let updatedCount = 0;
    for (const category of goalCategories) {
      if (!category.icon || category.icon === "fa-question-circle") {
        category.icon = "fa-bullseye";
        await category.save();
        updatedCount++;
      }
    }

    res.status(200).json({
      message: `Đã cập nhật icon cho ${updatedCount} goal categories`,
      updatedCount,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Lỗi khi cập nhật icon cho goal categories");
  }
});

const getGoalsFixed = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    filter,
    sortType = "CREATED",
    sortDirection = "desc",
  } = req.query;

  const normalizedFilter = filter ? filter.toUpperCase() : "ALL";
  const normalizedSortType = sortType ? sortType.toUpperCase() : "CREATED";
  const normalizedSortDirection = sortDirection === "asc" ? "asc" : "desc";
  const now = new Date();

  const query = {
    user: req.user.id,
    archived: false,
  };

  if (normalizedFilter === "ARCHIVED") {
    query.archived = true;
  } else if (normalizedFilter === "COMPLETED") {
    query.$expr = { $gte: ["$currentAmount", "$targetAmount"] };
  } else if (normalizedFilter === "OVERDUE") {
    query.deadline = { $lt: now };
    query.$expr = { $lt: ["$currentAmount", "$targetAmount"] };
  } else if (
    normalizedFilter === "IN_PROGRESS" ||
    normalizedFilter === "ACTIVE"
  ) {
    query.$expr = { $lt: ["$currentAmount", "$targetAmount"] };
    query.$or = [
      { deadline: { $exists: false } },
      { deadline: null },
      { deadline: { $gte: now } },
    ];
  }

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
  const startIndex = (pageNumber - 1) * limitNumber;
  const allGoals = await Goal.find(query).lean();

  const getProgress = (goal) => {
    if (!goal.targetAmount || goal.targetAmount <= 0) return 0;
    return Math.min((goal.currentAmount || 0) / goal.targetAmount, 1);
  };

  const getSortValue = (goal) => {
    if (normalizedSortType === "PROGRESS") return getProgress(goal);
    if (normalizedSortType === "DEADLINE") {
      return goal.deadline ? new Date(goal.deadline).getTime() : null;
    }
    return goal.createdAt ? new Date(goal.createdAt).getTime() : 0;
  };

  const direction = normalizedSortDirection === "asc" ? 1 : -1;
  const sortedGoals = allGoals.sort((a, b) => {
    if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
      return a.isPinned ? -1 : 1;
    }

    const valueA = getSortValue(a);
    const valueB = getSortValue(b);

    if (valueA === null && valueB === null) return 0;
    if (valueA === null) return 1;
    if (valueB === null) return -1;

    return (valueA - valueB) * direction;
  });

  const goals = sortedGoals.slice(startIndex, startIndex + limitNumber);

  res.status(200).json({
    data: goals,
    currentPage: pageNumber,
    totalPages: Math.ceil(sortedGoals.length / limitNumber),
    totalGoals: sortedGoals.length,
  });
});

module.exports = {
  getGoals: getGoalsFixed,
  createGoal,
  updateGoal,
  deleteGoal,
  addFundsToGoal,
  toggleArchiveGoal,
  togglePinGoal,
  fixGoalCategoriesIcon,
};

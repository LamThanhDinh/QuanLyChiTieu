// backend/controllers/userController.js
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const LoginHistory = require("../models/LoginHistory");
// Thêm vào đầu file userController.js
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Category = require("../models/Category");
const Goal = require("../models/Goal");
const { exportToExcelBuffer, parseExcelBuffer } = require("../utils/excelHelper");

// @desc    Lấy thông tin hồ sơ người dùng
// @route   GET /api/users/profile
// @access  Private (Cần xác thực)
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user được gán từ middleware `verifyToken`
  const user = await User.findById(req.user.id).select("-password");

  if (user) {
    res.json({
      id: user._id,
      fullname: user.fullname,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng.");
  }
});

// @desc    Cập nhật hồ sơ người dùng
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.fullname = req.body.fullname || user.fullname;
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email đã tồn tại." });
      }
      user.email = req.body.email;
    }
    // Logic cập nhật avatar

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      fullname: updatedUser.fullname,
      username: updatedUser.username,
      avatar: updatedUser.avatar,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng.");
  }
});

// Upload avatar
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Không có file được upload.");
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng.");
  }
  user.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
    "base64"
  )}`;
  await user.save();
  res.json({ message: "Cập nhật avatar thành công", avatar: user.avatar });
});

// Đổi mật khẩu
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng.");
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Mật khẩu cũ không đúng.");
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Đổi mật khẩu thành công." });
});
const getLoginHistory = asyncHandler(async (req, res) => {
  const history = await LoginHistory.find({ userId: req.user.id })
    .sort({ timestamp: -1 }) // Sắp xếp mới nhất lên đầu
    .limit(10); // Giới hạn 10 bản ghi gần nhất
  res.json(history);
});
const deleteUserAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Xóa tất cả dữ liệu liên quan
  await Transaction.deleteMany({ userId });
  await Account.deleteMany({ userId });
  await Category.deleteMany({ userId });
  await Goal.deleteMany({ user: userId });
  await LoginHistory.deleteMany({ userId });

  // Xóa người dùng
  await User.findByIdAndDelete(userId);

  res.json({ message: "Tài khoản và toàn bộ dữ liệu đã được xóa thành công." });
});

//  THÊM: Export user data
const exportUserData = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all user data
    const [user, accounts, categories, transactions, goals] = await Promise.all(
      [
        User.findById(userId).select("-password"),
        Account.find({ userId }),
        Category.find({ userId }),
        Transaction.find({ userId }).populate("categoryId accountId"),
        Goal.find({ user: userId }), // ✅ Fetch ALL goal fields
      ]
    );

    //  Ensure goals include all necessary fields
    const exportData = {
      user: {
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      accounts: accounts.map((account) => ({
        _id: account._id,
        name: account.name,
        type: account.type,
        initialBalance: account.initialBalance,
        icon: account.icon,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
      categories: categories.map((category) => ({
        _id: category._id,
        name: category.name,
        type: category.type,
        icon: category.icon,
        isGoalCategory: category.isGoalCategory,
        goalId: category.goalId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
      transactions: transactions.map((transaction) => ({
        _id: transaction._id,
        type: transaction.type,
        name: transaction.name,
        amount: transaction.amount,
        date: transaction.date,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        note: transaction.note,
        goalId: transaction.goalId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      })),
      //  Include ALL goal fields including completion and pin status
      goals: goals.map((goal) => ({
        _id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
        icon: goal.icon,
        status: goal.status, //  Export completion status
        isPinned: goal.isPinned, //  Export pin status
        archived: goal.archived, //  Export archive status
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      })),
      exportedAt: new Date(),
      version: "1.2", //  Update version
    };

    res.status(200).json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500);
    throw new Error("Lỗi khi xuất dữ liệu");
  }
});

//  THÊM: Clear all user data
const clearUserData = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete in correct order to avoid foreign key constraints
    await Transaction.deleteMany({ userId });
    await Goal.deleteMany({ user: userId });
    await Category.deleteMany({ userId });
    await Account.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "Đã xóa toàn bộ dữ liệu người dùng",
    });
  } catch (error) {
    console.error("Clear data error:", error);
    res.status(500);
    throw new Error("Lỗi khi xóa dữ liệu");
  }
});

//  THÊM: Import user data
const importUserData = asyncHandler(async (req, res) => {
  const { data, clearExisting } = req.body;

  if (!data) {
    res.status(400);
    throw new Error("Dữ liệu không hợp lệ");
  }

  try {
    const userId = req.user.id;
    let importStats = {
      accounts: 0,
      categories: 0,
      transactions: 0,
      goals: 0,
      errors: [],
    };

    //  Clear existing data first if requested
    if (clearExisting) {
      console.log("Clearing existing data for user:", userId);
      await Transaction.deleteMany({ userId });
      await Goal.deleteMany({ user: userId });
      await Category.deleteMany({ userId });
      await Account.deleteMany({ userId });
    }

    console.log("Starting import for user:", userId);

    //  Import Accounts
    if (data.accounts && Array.isArray(data.accounts)) {
      for (const accountData of data.accounts) {
        try {
          // Only create if doesn't exist (for non-clearExisting scenarios)
          const existingAccount = await Account.findOne({
            userId,
            name: accountData.name,
            type: accountData.type,
          });

          if (!existingAccount) {
            await Account.create({
              userId,
              name: accountData.name,
              type: accountData.type,
              initialBalance: accountData.initialBalance ?? accountData.balance ?? 0,
              icon: accountData.icon || "fa-wallet",
              createdAt: new Date(accountData.createdAt) || new Date(),
              updatedAt: new Date(accountData.updatedAt) || new Date(),
            });
            importStats.accounts++;
          }
        } catch (error) {
          importStats.errors.push(
            `Account "${accountData.name}": ${error.message}`
          );
        }
      }
    }

    // Import Categories
    if (data.categories && Array.isArray(data.categories)) {
      for (const categoryData of data.categories) {
        try {
          // Only create if doesn't exist (for non-clearExisting scenarios)
          const existingCategory = await Category.findOne({
            userId,
            name: categoryData.name,
            type: categoryData.type,
          });

          if (!existingCategory) {
            await Category.create({
              userId,
              name: categoryData.name,
              type: categoryData.type,
              icon: categoryData.icon || "fa-question-circle",
              isGoalCategory: categoryData.isGoalCategory || false,
              goalId: categoryData.goalId || null,
              createdAt: new Date(categoryData.createdAt) || new Date(),
              updatedAt: new Date(categoryData.updatedAt) || new Date(),
            });
            importStats.categories++;
          }
        } catch (error) {
          importStats.errors.push(
            `Category "${categoryData.name}": ${error.message}`
          );
        }
      }
    }

    //  Import Goals with ALL fields
    if (data.goals && Array.isArray(data.goals)) {
      for (const goalData of data.goals) {
        try {
          // Only create if doesn't exist (for non-clearExisting scenarios)
          const existingGoal = await Goal.findOne({
            user: userId,
            name: goalData.name,
            targetAmount: goalData.targetAmount,
          });

          if (!existingGoal) {
            await Goal.create({
              user: userId,
              name: goalData.name,
              targetAmount: goalData.targetAmount,
              currentAmount: goalData.currentAmount || 0,
              deadline: new Date(goalData.deadline),
              icon: goalData.icon || "🎯",
              status: goalData.status || "in-progress", //  Import completion status
              isPinned: goalData.isPinned || false, //  Import pin status
              archived: goalData.archived || false, //  Import archive status
              createdAt: new Date(goalData.createdAt) || new Date(),
              updatedAt: new Date(goalData.updatedAt) || new Date(),
            });
            importStats.goals++;
          }
        } catch (goalError) {
          importStats.errors.push(
            `Goal "${goalData.name}": ${goalError.message}`
          );
        }
      }
    }

    //  Import Transactions (after accounts and categories)
    if (data.transactions && Array.isArray(data.transactions)) {
      for (const transactionData of data.transactions) {
        try {
          // Find corresponding account and category by name or ID
          let accountId = null;
          let categoryId = null;

          // Try to find account by name (from populated data) or by ID
          if (transactionData.accountId) {
            if (
              typeof transactionData.accountId === "object" &&
              transactionData.accountId.name
            ) {
              const account = await Account.findOne({
                userId,
                name: transactionData.accountId.name,
              });
              accountId = account ? account._id : null;
            } else {
              // Direct ID reference - try to find by ID
              const account = await Account.findOne({
                userId,
                _id: transactionData.accountId,
              });
              accountId = account ? account._id : null;
            }
          }

          // Try to find category by name (from populated data) or by ID
          if (transactionData.categoryId) {
            if (
              typeof transactionData.categoryId === "object" &&
              transactionData.categoryId.name
            ) {
              const category = await Category.findOne({
                userId,
                name: transactionData.categoryId.name,
              });
              categoryId = category ? category._id : null;
            } else {
              // Direct ID reference - try to find by ID
              const category = await Category.findOne({
                userId,
                _id: transactionData.categoryId,
              });
              categoryId = category ? category._id : null;
            }
          }

          if (accountId && categoryId) {
            await Transaction.create({
              userId,
              type: transactionData.type,
              name: transactionData.name,
              amount: transactionData.amount,
              date: new Date(transactionData.date) || new Date(),
              accountId: accountId,
              categoryId: categoryId,
              note: transactionData.note || "",
              goalId: transactionData.goalId || null,
              createdAt: new Date(transactionData.createdAt) || new Date(),
              updatedAt: new Date(transactionData.updatedAt) || new Date(),
            });
            importStats.transactions++;
          } else {
            importStats.errors.push(
              `Transaction "${transactionData.name}": Cannot find matching account or category`
            );
          }
        } catch (error) {
          importStats.errors.push(
            `Transaction "${transactionData.name}": ${error.message}`
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Nhập dữ liệu thành công",
      stats: importStats,
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500);
    throw new Error("Lỗi khi nhập dữ liệu");
  }
});

//  THÊM: Export user data to Excel
const exportUserDataExcel = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all user data
    const [user, accounts, categories, transactions, goals] = await Promise.all(
      [
        User.findById(userId).select("-password"),
        Account.find({ userId }),
        Category.find({ userId }),
        Transaction.find({ userId }).populate("categoryId accountId"),
        Goal.find({ user: userId }),
      ]
    );

    // Prepare data for Excel
    const exportData = {
      user: {
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      accounts: accounts.map((account) => ({
        _id: account._id,
        name: account.name,
        type: account.type,
        initialBalance: account.initialBalance,
        icon: account.icon,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
      categories: categories.map((category) => ({
        _id: category._id,
        name: category.name,
        type: category.type,
        icon: category.icon,
        isGoalCategory: category.isGoalCategory,
        goalId: category.goalId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
      transactions: transactions.map((transaction) => ({
        _id: transaction._id,
        type: transaction.type,
        name: transaction.name,
        amount: transaction.amount,
        date: transaction.date,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        note: transaction.note,
        goalId: transaction.goalId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      })),
      goals: goals.map((goal) => ({
        _id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
        icon: goal.icon,
        status: goal.status,
        isPinned: goal.isPinned,
        archived: goal.archived,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      })),
      exportedAt: new Date(),
      version: "1.2",
    };

    // Convert to Excel
    const excelBuffer = exportToExcelBuffer(exportData);

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="backup_${user.username}_${new Date().toISOString().split("T")[0]}.xlsx"`
    );

    res.send(excelBuffer);
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500);
    throw new Error("Lỗi khi xuất dữ liệu Excel");
  }
});

//  THÊM: Import user data from Excel
const importUserDataExcel = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Vui lòng cung cấp file Excel" });
  }

  try {
    const userId = req.user.id;
    const shouldClearExisting =
      req.body.clearExisting === true || req.body.clearExisting === "true";

    // Parse Excel file
    let data;
    try {
      data = parseExcelBuffer(req.file.buffer);
      console.log("Parsed Excel data:", {
        accounts: data.accounts?.length || 0,
        categories: data.categories?.length || 0,
        goals: data.goals?.length || 0,
        transactions: data.transactions?.length || 0,
      });
    } catch (parseError) {
      console.error("Excel parse error:", parseError.message);
      return res.status(400).json({
        success: false,
        message: "Không thể đọc file Excel: " + parseError.message,
      });
    }

    let importStats = {
      accounts: 0,
      categories: 0,
      transactions: 0,
      goals: 0,
      errors: [],
    };

    //  Clear existing data first if requested
    if (shouldClearExisting) {
      console.log("Clearing existing data for user:", userId);
      await Transaction.deleteMany({ userId });
      await Goal.deleteMany({ user: userId });
      await Category.deleteMany({ userId });
      await Account.deleteMany({ userId });
    }

    console.log("Starting import from Excel for user:", userId);

    //  Import Accounts
    if (data.accounts && Array.isArray(data.accounts)) {
      for (const accountData of data.accounts) {
        try {
          if (!accountData.name) continue; // Bỏ qua row rỗng
          const existingAccount = await Account.findOne({
            userId,
            name: accountData.name,
            type: accountData.type,
          });

          if (!existingAccount) {
            await Account.create({
              userId,
              name: accountData.name,
              type: accountData.type,
              initialBalance: accountData.initialBalance ?? accountData.balance ?? 0,
              icon: accountData.icon || "fa-wallet",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            importStats.accounts++;
          }
        } catch (error) {
          importStats.errors.push(
            `Account "${accountData.name}": ${error.message}`
          );
        }
      }
    }

    // Import Categories
    if (data.categories && Array.isArray(data.categories)) {
      for (const categoryData of data.categories) {
        try {
          if (!categoryData.name) continue; // Bỏ qua row rỗng
          const existingCategory = await Category.findOne({
            userId,
            name: categoryData.name,
            type: categoryData.type,
          });

          if (!existingCategory) {
            await Category.create({
              userId,
              name: categoryData.name,
              type: categoryData.type,
              icon: categoryData.icon || "fa-question-circle",
              isGoalCategory: categoryData.isGoalCategory || false,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            importStats.categories++;
          }
        } catch (error) {
          importStats.errors.push(
            `Category "${categoryData.name}": ${error.message}`
          );
        }
      }
    }

    //  Import Goals
    if (data.goals && Array.isArray(data.goals)) {
      for (const goalData of data.goals) {
        try {
          if (!goalData.name) continue; // Bỏ qua row rỗng
          const existingGoal = await Goal.findOne({
            user: userId,
            name: goalData.name,
            targetAmount: goalData.targetAmount,
          });

          if (!existingGoal) {
            const deadline = goalData.deadline ? new Date(goalData.deadline) : null;
            await Goal.create({
              user: userId,
              name: goalData.name,
              targetAmount: goalData.targetAmount,
              currentAmount: goalData.currentAmount || 0,
              deadline: deadline,
              icon: goalData.icon || "🎯",
              status: goalData.status || "in-progress",
              isPinned: goalData.isPinned || false,
              archived: goalData.archived || false,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            importStats.goals++;
          }
        } catch (error) {
          importStats.errors.push(
            `Goal "${goalData.name}": ${error.message}`
          );
        }
      }
    }

    const [importedAccounts, importedCategories] = await Promise.all([
      Account.find({ userId }).select("_id name"),
      Category.find({ userId }).select("_id name"),
    ]);
    const accountMap = new Map(
      importedAccounts.map((account) => [account.name, account._id])
    );
    const categoryMap = new Map(
      importedCategories.map((category) => [category.name, category._id])
    );

    //  Import Transactions (after accounts and categories)
    if (data.transactions && Array.isArray(data.transactions)) {
      for (const transactionData of data.transactions) {
        try {
          if (!transactionData.name) continue; // Bỏ qua row rỗng
          const accountName =
            typeof transactionData.accountId === "object"
              ? transactionData.accountId.name
              : transactionData.accountId;
          const categoryName =
            typeof transactionData.categoryId === "object"
              ? transactionData.categoryId.name
              : transactionData.categoryId;
          const accountId = accountMap.get(accountName) || null;
          const categoryId = categoryMap.get(categoryName) || null;

          if (accountId && categoryId) {
            await Transaction.create({
              userId,
              type: transactionData.type,
              name: transactionData.name,
              amount: transactionData.amount,
              date: new Date(transactionData.date),
              accountId: accountId,
              categoryId: categoryId,
              note: transactionData.note || "",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            importStats.transactions++;
          } else {
            importStats.errors.push(
              `Transaction "${transactionData.name}": Không tìm thấy tài khoản "${accountName}" hoặc danh mục "${categoryName}"`
            );
          }
        } catch (error) {
          importStats.errors.push(
            `Transaction "${transactionData.name}": ${error.message}`
          );
        }
      }
    }

    console.log("Import Excel done. Stats:", importStats);
    return res.status(200).json({
      success: true,
      message: "Nhập dữ liệu Excel thành công",
      stats: importStats,
    });
  } catch (error) {
    console.error("Excel import error:", error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi nhập dữ liệu Excel: " + (error.message || "Lỗi không xác định"),
    });
  }
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateAvatar,
  changePassword,
  getLoginHistory,
  deleteUserAccount,
  clearUserData, //  Add clear function
  exportUserData, //  Export function
  importUserData, //  Import function
  exportUserDataExcel, //  Export Excel function
  importUserDataExcel, //  Import Excel function
};

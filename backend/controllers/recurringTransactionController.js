const mongoose = require("mongoose");
const RecurringTransaction = require("../models/RecurringTransaction");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Category = require("../models/Category");

const toObjectId = (id) =>
  typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;

const normalizeDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const getLastDayOfUtcMonth = (year, monthIndex) =>
  new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

const buildUtcDatePreservingTime = (sourceDate, year, monthIndex, day) =>
  new Date(
    Date.UTC(
      year,
      monthIndex,
      day,
      sourceDate.getUTCHours(),
      sourceDate.getUTCMinutes(),
      sourceDate.getUTCSeconds(),
      sourceDate.getUTCMilliseconds()
    )
  );

const calculateNextRunDate = (currentDate, frequency, dayOfMonth = null) => {
  const sourceDate = new Date(currentDate);

  if (frequency === "monthly" || frequency === "yearly") {
    const preferredDay = Number(dayOfMonth) || sourceDate.getUTCDate();
    const targetYear =
      frequency === "yearly"
        ? sourceDate.getUTCFullYear() + 1
        : sourceDate.getUTCFullYear() +
          Math.floor((sourceDate.getUTCMonth() + 1) / 12);
    const targetMonth =
      frequency === "yearly"
        ? sourceDate.getUTCMonth()
        : (sourceDate.getUTCMonth() + 1) % 12;
    const targetDay = Math.min(
      preferredDay,
      getLastDayOfUtcMonth(targetYear, targetMonth)
    );

    return buildUtcDatePreservingTime(
      sourceDate,
      targetYear,
      targetMonth,
      targetDay
    );
  }

  const nextDate = new Date(sourceDate);

  switch (frequency) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    default:
      break;
  }

  return nextDate;
};

const validateReferences = async ({ userId, accountId, categoryId, type }) => {
  const [account, category] = await Promise.all([
    Account.findOne({ _id: accountId, userId }),
    Category.findOne({ _id: categoryId, userId }),
  ]);

  if (!account) {
    return { error: "Không tìm thấy tài khoản phù hợp" };
  }

  if (!category) {
    return { error: "Không tìm thấy danh mục phù hợp" };
  }

  if (category.type !== type) {
    return {
      error: "Loại giao dịch không khớp với loại danh mục đã chọn",
    };
  }

  return { account, category };
};

const enrichRecurring = (recurring) => {
  const object = recurring.toObject ? recurring.toObject() : recurring;
  const now = new Date();
  const nextRunDate = object.nextRunDate ? new Date(object.nextRunDate) : null;
  const endDate = object.endDate ? new Date(object.endDate) : null;
  const isEnded = Boolean(endDate && endDate < now);
  const isDue = Boolean(object.isActive && !isEnded && nextRunDate <= now);

  return {
    ...object,
    isDue,
    isEnded,
  };
};

const getRecurringTransactions = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const now = new Date();
    const filter = { userId: req.user.id };

    if (status === "active") filter.isActive = true;
    if (status === "paused") filter.isActive = false;
    if (status === "due") {
      filter.isActive = true;
      filter.nextRunDate = { $lte: now };
      filter.$or = [{ endDate: null }, { endDate: { $gte: now } }];
    }

    const recurringTransactions = await RecurringTransaction.find(filter)
      .populate("accountId", "name type bankName")
      .populate("categoryId", "name type icon")
      .sort({ isActive: -1, nextRunDate: 1, createdAt: -1 });

    res.json({
      data: recurringTransactions.map(enrichRecurring),
    });
  } catch (error) {
    console.error("Error getting recurring transactions:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách giao dịch định kỳ",
      error: error.message,
    });
  }
};

const createRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      amount,
      type,
      accountId,
      categoryId,
      frequency = "monthly",
      nextRunDate,
      endDate,
      note = "",
      autoCreate = false,
      isActive = true,
    } = req.body;

    const numericAmount = Number(amount);
    const parsedNextRunDate = normalizeDate(nextRunDate);
    const parsedEndDate = endDate ? normalizeDate(endDate) : null;

    if (!name || !accountId || !categoryId || !type || !parsedNextRunDate) {
      return res.status(400).json({
        message: "Thiếu tên, tài khoản, danh mục, loại hoặc ngày chạy tiếp theo",
      });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Số tiền giao dịch định kỳ phải lớn hơn 0",
      });
    }

    const referenceCheck = await validateReferences({
      userId,
      accountId,
      categoryId,
      type,
    });

    if (referenceCheck.error) {
      return res.status(400).json({ message: referenceCheck.error });
    }

    const recurringTransaction = await RecurringTransaction.create({
      userId,
      name,
      amount: Math.round(numericAmount),
      type,
      accountId,
      categoryId,
      frequency,
      nextRunDate: parsedNextRunDate,
      dayOfMonth:
        frequency === "monthly" || frequency === "yearly"
          ? parsedNextRunDate.getUTCDate()
          : null,
      endDate: parsedEndDate,
      note,
      autoCreate,
      isActive,
    });

    const populated = await RecurringTransaction.findById(
      recurringTransaction._id
    )
      .populate("accountId", "name type bankName")
      .populate("categoryId", "name type icon");

    res.status(201).json(enrichRecurring(populated));
  } catch (error) {
    console.error("Error creating recurring transaction:", error);
    res.status(500).json({
      message: "Lỗi khi tạo giao dịch định kỳ",
      error: error.message,
    });
  }
};

const UPDATABLE_FIELDS = [
  "name",
  "amount",
  "type",
  "accountId",
  "categoryId",
  "frequency",
  "nextRunDate",
  "dayOfMonth",
  "endDate",
  "note",
  "autoCreate",
  "isActive",
];

const updateRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId,
    });

    if (!recurring) {
      return res.status(404).json({
        message: "Không tìm thấy giao dịch định kỳ",
      });
    }

    // Chỉ lấy các field được phép cập nhật, bỏ qua userId/generatedCount...
    const updates = {};
    UPDATABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.amount !== undefined) {
      updates.amount = Number(updates.amount);
      if (!Number.isFinite(updates.amount) || updates.amount <= 0) {
        return res.status(400).json({
          message: "Số tiền giao dịch định kỳ phải lớn hơn 0",
        });
      }
      updates.amount = Math.round(updates.amount);
    }

    if (updates.nextRunDate !== undefined) {
      const parsedNextRunDate = normalizeDate(updates.nextRunDate);
      if (!parsedNextRunDate) {
        return res.status(400).json({
          message: "Ngày chạy tiếp theo không hợp lệ",
        });
      }
      updates.nextRunDate = parsedNextRunDate;
      updates.dayOfMonth = parsedNextRunDate.getUTCDate();
    }

    if (updates.dayOfMonth !== undefined) {
      const parsedDayOfMonth = Number(updates.dayOfMonth);
      if (
        !Number.isInteger(parsedDayOfMonth) ||
        parsedDayOfMonth < 1 ||
        parsedDayOfMonth > 31
      ) {
        return res.status(400).json({
          message: "Ngày chạy trong tháng phải từ 1 đến 31",
        });
      }
      updates.dayOfMonth = parsedDayOfMonth;
    }

    if (updates.endDate !== undefined && updates.endDate !== "") {
      const parsedEndDate = normalizeDate(updates.endDate);
      if (!parsedEndDate) {
        return res.status(400).json({
          message: "Ngày kết thúc không hợp lệ",
        });
      }
      updates.endDate = parsedEndDate;
    } else if (updates.endDate === "") {
      updates.endDate = null;
    }

    const effectiveFrequency = updates.frequency || recurring.frequency;
    if (effectiveFrequency === "daily" || effectiveFrequency === "weekly") {
      updates.dayOfMonth = null;
    } else if (
      (effectiveFrequency === "monthly" || effectiveFrequency === "yearly") &&
      updates.dayOfMonth === undefined
    ) {
      updates.dayOfMonth =
        recurring.dayOfMonth ||
        (updates.nextRunDate || recurring.nextRunDate).getUTCDate();
    }

    const accountId = updates.accountId || recurring.accountId;
    const categoryId = updates.categoryId || recurring.categoryId;
    const type = updates.type || recurring.type;

    const referenceCheck = await validateReferences({
      userId,
      accountId,
      categoryId,
      type,
    });

    if (referenceCheck.error) {
      return res.status(400).json({ message: referenceCheck.error });
    }

    Object.assign(recurring, updates);
    await recurring.save();

    const populated = await RecurringTransaction.findById(recurring._id)
      .populate("accountId", "name type bankName")
      .populate("categoryId", "name type icon");

    res.json(enrichRecurring(populated));
  } catch (error) {
    console.error("Error updating recurring transaction:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật giao dịch định kỳ",
      error: error.message,
    });
  }
};

const deleteRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!recurring) {
      return res.status(404).json({
        message: "Không tìm thấy giao dịch định kỳ",
      });
    }

    res.json({ message: "Xóa giao dịch định kỳ thành công" });
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    res.status(500).json({
      message: "Lỗi khi xóa giao dịch định kỳ",
      error: error.message,
    });
  }
};

const createTransactionFromRecurring = async (recurring, runDate = null) => {
  const transactionDate = runDate || recurring.nextRunDate || new Date();

  const transaction = await Transaction.create({
    userId: recurring.userId,
    accountId: recurring.accountId,
    categoryId: recurring.categoryId,
    name: recurring.name,
    amount: recurring.amount,
    type: recurring.type,
    note: recurring.note || "Tạo từ giao dịch định kỳ",
    date: transactionDate,
    recurringTransactionId: recurring._id,
  });

  recurring.lastRunDate = transactionDate;
  recurring.generatedCount += 1;
  recurring.nextRunDate = calculateNextRunDate(
    recurring.nextRunDate || transactionDate,
    recurring.frequency,
    recurring.dayOfMonth
  );

  if (recurring.endDate && recurring.nextRunDate > recurring.endDate) {
    recurring.isActive = false;
  }

  await recurring.save();

  return transaction;
};

const runRecurringTransaction = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!recurring) {
      return res.status(404).json({
        message: "Không tìm thấy giao dịch định kỳ",
      });
    }

    if (!recurring.isActive) {
      return res.status(400).json({
        message: "Giao dịch định kỳ đang tạm dừng",
      });
    }

    // Kiểm tra ngày kết thúc trước khi cho phép tạo thủ công
    const now = new Date();
    if (recurring.endDate && new Date(recurring.endDate) < now) {
      return res.status(400).json({
        message: "Giao dịch định kỳ này đã hết hạn và không thể tạo thêm",
      });
    }

    const transaction = await createTransactionFromRecurring(recurring);
    const populatedRecurring = await RecurringTransaction.findById(recurring._id)
      .populate("accountId", "name type bankName")
      .populate("categoryId", "name type icon");

    res.status(201).json({
      message: "Đã tạo giao dịch từ mẫu định kỳ",
      transaction,
      recurringTransaction: enrichRecurring(populatedRecurring),
    });
  } catch (error) {
    console.error("Error running recurring transaction:", error);
    res.status(500).json({
      message: "Lỗi khi tạo giao dịch từ mẫu định kỳ",
      error: error.message,
    });
  }
};

const getGeneratedTransactions = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!recurring) {
      return res.status(404).json({
        message: "Không tìm thấy giao dịch định kỳ",
      });
    }

    const transactions = await Transaction.find({
      userId: req.user.id,
      recurringTransactionId: req.params.id,
    })
      .populate("accountId", "name type")
      .populate("categoryId", "name icon type")
      .sort({ date: -1, createdAt: -1 })
      .limit(50);

    res.json({
      data: transactions.map((transaction) => ({
        id: transaction._id,
        createdAt: transaction.createdAt,
        date: transaction.date,
        description: transaction.name,
        note: transaction.note,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.categoryId,
        paymentMethod: transaction.accountId,
        recurringTransactionId: transaction.recurringTransactionId,
      })),
    });
  } catch (error) {
    console.error("Error getting generated transactions:", error);
    res.status(500).json({
      message: "Lỗi khi lấy lịch sử giao dịch đã sinh",
      error: error.message,
    });
  }
};

const processDueRecurringTransactions = async (req, res) => {
  try {
    const now = new Date();
    const dueRecurringTransactions = await RecurringTransaction.find({
      userId: toObjectId(req.user.id),
      isActive: true,
      autoCreate: true,
      nextRunDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
    });

    const results = await Promise.allSettled(
      dueRecurringTransactions.map((recurring) =>
        createTransactionFromRecurring(recurring)
      )
    );

    const created = results.filter((result) => result.status === "fulfilled");
    const failed = results.filter((result) => result.status === "rejected");

    res.json({
      message: `Đã xử lý ${created.length}/${dueRecurringTransactions.length} giao dịch định kỳ đến hạn`,
      createdCount: created.length,
      failedCount: failed.length,
      errors: failed.map((result) => result.reason?.message || "Unknown error"),
    });
  } catch (error) {
    console.error("Error processing due recurring transactions:", error);
    res.status(500).json({
      message: "Lỗi khi xử lý giao dịch định kỳ đến hạn",
      error: error.message,
    });
  }
};

module.exports = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  runRecurringTransaction,
  getGeneratedTransactions,
  processDueRecurringTransactions,
};

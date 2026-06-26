const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Budget = require("../models/Budget");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");

const toObjectId = (id) =>
  typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;

const getMonthRange = (year, month) => ({
  start: new Date(Date.UTC(year, month - 1, 1)),
  end: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
});

const getDefaultBudgetPeriod = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

const getNextBudgetPeriod = () => {
  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    month: nextMonthDate.getMonth() + 1,
    year: nextMonthDate.getFullYear(),
  };
};

const normalizeMonthYear = (query, fallback = getDefaultBudgetPeriod()) => {
  const month = Number(query.month) || fallback.month;
  const year = Number(query.year) || fallback.year;
  return { month, year };
};

const formatCurrency = (amount) =>
  `${Math.round(amount || 0).toLocaleString("vi-VN")}đ`;

const roundBudgetAmount = (amount) => {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (amount < 100000) return Math.ceil(amount / 10000) * 10000;
  return Math.ceil(amount / 50000) * 50000;
};

const getSpentByCategory = async (userObjectId, month, year) => {
  const { start, end } = getMonthRange(year, month);
  const totals = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: "CHITIEU",
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$categoryId",
        spent: { $sum: "$amount" },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  return totals.reduce((map, item) => {
    map[item._id.toString()] = {
      spent: item.spent || 0,
      transactionCount: item.transactionCount || 0,
    };
    return map;
  }, {});
};

const getIncomeSummary = async (userObjectId, month, year) => {
  const { start, end } = getMonthRange(year, month);
  const [summary] = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: "THUNHAP",
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: "$amount" },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  return {
    totalIncome: summary?.totalIncome || 0,
    transactionCount: summary?.transactionCount || 0,
  };
};

const enrichBudget = (budget, spentMap) => {
  const budgetObject = budget.toObject ? budget.toObject() : budget;
  const categoryId = budgetObject.categoryId?._id || budgetObject.categoryId;
  const categoryKey = categoryId?.toString();
  const spentInfo = spentMap[categoryKey] || {
    spent: 0,
    transactionCount: 0,
  };
  const spentAmount = spentInfo.spent;
  const remainingAmount = Math.max((budgetObject.amount || 0) - spentAmount, 0);
  const usedPercentage =
    budgetObject.amount > 0 ? (spentAmount / budgetObject.amount) * 100 : 0;

  return {
    ...budgetObject,
    spentAmount,
    remainingAmount,
    usedPercentage,
    transactionCount: spentInfo.transactionCount,
    status:
      usedPercentage >= 100
        ? "exceeded"
        : usedPercentage >= (budgetObject.threshold || 80)
          ? "warning"
          : "safe",
  };
};

const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = toObjectId(userId);
    const { month, year } = normalizeMonthYear(req.query);

    const [budgets, spentMap, incomeSummary] = await Promise.all([
      Budget.find({ userId, month, year })
        .populate("categoryId", "name type icon")
        .sort({ createdAt: -1 }),
      getSpentByCategory(userObjectId, month, year),
      getIncomeSummary(userObjectId, month, year),
    ]);

    res.json({
      month,
      year,
      incomeSummary,
      budgets: budgets.map((budget) => {
        console.log("[DEBUG backend] budget categoryId:", JSON.stringify(budget.categoryId));
        return enrichBudget(budget, spentMap);
      }),
    });
  } catch (error) {
    console.error("Error getting budgets:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách ngân sách",
      error: error.message,
    });
  }
};

const upsertBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      categoryId,
      amount,
      month,
      year,
      threshold = 80,
      note = "",
      isActive = true,
    } = req.body;

    const numericAmount = Number(amount);

    if (!categoryId || amount === undefined || !month || !year) {
      return res.status(400).json({
        message: "Thiếu danh mục, số tiền, tháng hoặc năm ngân sách",
      });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Số tiền ngân sách phải lớn hơn 0",
      });
    }

    const category = await Category.findOne({
      _id: categoryId,
      userId,
      type: "CHITIEU",
      isGoalCategory: { $ne: true },
    });

    if (!category) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục chi tiêu phù hợp",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        userId,
        categoryId,
        month: Number(month),
        year: Number(year),
        period: "monthly",
      },
      {
        amount: numericAmount,
        threshold: Number(threshold),
        note,
        isActive,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate("categoryId", "name type icon");

    const spentMap = await getSpentByCategory(toObjectId(userId), month, year);

    res.status(201).json(enrichBudget(budget, spentMap));
  } catch (error) {
    console.error("Error saving budget:", error);
    res.status(500).json({
      message: "Lỗi khi lưu ngân sách",
      error: error.message,
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = {};

    ["amount", "threshold", "note", "isActive"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.amount !== undefined) {
      updates.amount = Number(updates.amount);
      if (!Number.isFinite(updates.amount) || updates.amount <= 0) {
        return res.status(400).json({
          message: "Số tiền ngân sách phải lớn hơn 0",
        });
      }
    }
    if (updates.threshold !== undefined) {
      updates.threshold = Number(updates.threshold);
    }

    const budget = await Budget.findOneAndUpdate({ _id: id, userId }, updates, {
      new: true,
      runValidators: true,
    }).populate("categoryId", "name type icon");

    if (!budget) {
      return res.status(404).json({ message: "Không tìm thấy ngân sách" });
    }

    const spentMap = await getSpentByCategory(
      toObjectId(userId),
      budget.month,
      budget.year
    );

    res.json(enrichBudget(budget, spentMap));
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật ngân sách",
      error: error.message,
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({ message: "Không tìm thấy ngân sách" });
    }

    res.json({ message: "Xóa ngân sách thành công" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({
      message: "Lỗi khi xóa ngân sách",
      error: error.message,
    });
  }
};

const buildBaseSuggestions = async (userId, targetMonth, targetYear) => {
  const userObjectId = toObjectId(userId);
  const usesCurrentYearHistory = targetMonth > 1;
  const lookbackStart = usesCurrentYearHistory
    ? new Date(Date.UTC(targetYear, 0, 1))
    : new Date(Date.UTC(targetYear - 1, 6, 1));
  const lookbackEnd = new Date(
    Date.UTC(targetYear, targetMonth - 1, 0, 23, 59, 59, 999)
  );
  const historyMonths = [];
  const cursor = new Date(
    Date.UTC(lookbackStart.getUTCFullYear(), lookbackStart.getUTCMonth(), 1)
  );
  while (cursor <= lookbackEnd) {
    historyMonths.push({
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth() + 1,
      key: `${cursor.getUTCFullYear()}-${cursor.getUTCMonth() + 1}`,
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const historyLabel = usesCurrentYearHistory
    ? `${historyMonths.length} tháng đã qua trong năm ${targetYear}`
    : `${historyMonths.length} tháng cuối năm ${targetYear - 1}`;

  const [categories, transactionStats, existingBudgets] = await Promise.all([
    Category.find({
      userId,
      type: "CHITIEU",
      isGoalCategory: { $ne: true },
    }).sort({ name: 1 }),
    Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: "CHITIEU",
          date: { $gte: lookbackStart, $lte: lookbackEnd },
        },
      },
      {
        $group: {
          _id: {
            categoryId: "$categoryId",
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
    ]),
    Budget.find({ userId, month: targetMonth, year: targetYear }),
  ]);

  const monthlyMap = {};
  transactionStats.forEach((item) => {
    const key = item._id.categoryId.toString();
    const monthKey = `${item._id.year}-${item._id.month}`;
    if (!monthlyMap[key]) monthlyMap[key] = {};
    monthlyMap[key][monthKey] = item.total || 0;
  });

  const existingBudgetMap = existingBudgets.reduce((map, budget) => {
    map[budget.categoryId.toString()] = budget;
    return map;
  }, {});

  return categories
    .map((category) => {
      const categoryHistory = monthlyMap[category._id.toString()] || {};
      const history = historyMonths.map(
        (monthItem) => categoryHistory[monthItem.key] || 0
      );
      const monthsWithData = history.filter((amount) => amount > 0).length;
      if (monthsWithData === 0) return null;

      const total = history.reduce((sum, amount) => sum + amount, 0);
      const average = total / history.length;
      const max = Math.max(...history);
      const min = Math.min(...history);
      const volatility = average > 0 ? (max - min) / average : 0;
      const bufferRate = volatility > 0.5 ? 0.15 : 0.08;
      const suggestedAmount = roundBudgetAmount(average * (1 + bufferRate));
      const currentBudget = existingBudgetMap[category._id.toString()];

      return {
        categoryId: category._id,
        categoryName: category.name,
        icon: category.icon,
        averageMonthlyExpense: average,
        highestMonthlyExpense: max,
        lowestMonthlyExpense: min,
        monthsAnalyzed: history.length,
        monthsWithData,
        suggestedAmount,
        currentBudgetAmount: currentBudget?.amount || null,
        confidence:
          history.length >= 4 && monthsWithData >= 2
            ? "high"
            : monthsWithData >= 2
              ? "medium"
              : "low",
        reason:
          volatility > 0.5
            ? `Chi tiêu ${category.name} dao động mạnh trong ${historyLabel}, đề xuất cộng thêm vùng đệm so với trung bình ${formatCurrency(average)}.`
            : `Dựa trên trung bình ${formatCurrency(average)} từ ${historyLabel}.`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.suggestedAmount - a.suggestedAmount);
};

const tryGeminiRefineSuggestions = async (suggestions, targetMonth, targetYear) => {
  if (!process.env.GEMINI_API_KEY || suggestions.length === 0) {
    return suggestions;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = `
Bạn là trợ lý tài chính cá nhân. Hãy tinh chỉnh lý do đề xuất ngân sách tháng ${targetMonth}/${targetYear}.
Không thay đổi categoryId. Có thể chỉnh suggestedAmount nhưng chỉ trong khoảng +/-10% so với suggestedAmount hiện tại.
Trả về JSON thuần túy dạng:
{
  "suggestions": [
    {
      "categoryId": "...",
      "suggestedAmount": 1000000,
      "reason": "lý do ngắn gọn bằng tiếng Việt"
    }
  ]
}

Dữ liệu:
${JSON.stringify(suggestions.slice(0, 12))}
`;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini budget timeout")), 8000)
      ),
    ]);
    const text = await result.response.text();
    const jsonText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonText);
    const refinedMap = new Map(
      (parsed.suggestions || []).map((item) => [String(item.categoryId), item])
    );

    return suggestions.map((suggestion) => {
      const refined = refinedMap.get(String(suggestion.categoryId));
      if (!refined) return suggestion;

      const minAmount = suggestion.suggestedAmount * 0.9;
      const maxAmount = suggestion.suggestedAmount * 1.1;
      const refinedAmount = Number(refined.suggestedAmount);
      const safeAmount =
        Number.isFinite(refinedAmount) &&
        refinedAmount >= minAmount &&
        refinedAmount <= maxAmount
          ? roundBudgetAmount(refinedAmount)
          : suggestion.suggestedAmount;

      return {
        ...suggestion,
        suggestedAmount: safeAmount,
        reason: refined.reason || suggestion.reason,
        source: "gemini",
      };
    });
  } catch (error) {
    console.error("Gemini budget refinement failed:", error.message);
    return suggestions.map((suggestion) => ({
      ...suggestion,
      source: "local",
    }));
  }
};

const suggestBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = normalizeMonthYear(
      req.query,
      getNextBudgetPeriod()
    );

    const baseSuggestions = await buildBaseSuggestions(userId, month, year);
    const suggestions = await tryGeminiRefineSuggestions(
      baseSuggestions,
      month,
      year
    );

    res.json({
      month,
      year,
      suggestions,
      summary:
        suggestions.length > 0
          ? `Đã đề xuất ${suggestions.length} ngân sách cho tháng ${month}/${year}.`
          : "Chưa đủ dữ liệu chi tiêu từ các tháng đã qua để đề xuất ngân sách.",
    });
  } catch (error) {
    console.error("Error suggesting budgets:", error);
    res.status(500).json({
      message: "Lỗi khi đề xuất ngân sách",
      error: error.message,
    });
  }
};

const applyBudgetSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year, suggestions = [] } = req.body;

    if (!month || !year || !Array.isArray(suggestions)) {
      return res.status(400).json({
        message: "Thiếu tháng, năm hoặc danh sách đề xuất",
      });
    }

    const validSuggestions = suggestions.filter((suggestion) => {
      const amount = Number(suggestion.suggestedAmount);
      return (
        suggestion.categoryId &&
        Number.isFinite(amount) &&
        amount > 0
      );
    });

    const savedBudgets = await Promise.all(
      validSuggestions.map((suggestion) =>
        Budget.findOneAndUpdate(
          {
            userId,
            categoryId: suggestion.categoryId,
            month: Number(month),
            year: Number(year),
            period: "monthly",
          },
          {
            amount: Number(suggestion.suggestedAmount),
            threshold: 80,
            note: suggestion.reason || "AI đề xuất từ lịch sử chi tiêu",
            isActive: true,
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        ).populate("categoryId", "name type icon")
      )
    );

    const spentMap = await getSpentByCategory(toObjectId(userId), month, year);

    res.status(201).json({
      message: `Đã áp dụng ${savedBudgets.length} ngân sách`,
      budgets: savedBudgets.map((budget) => enrichBudget(budget, spentMap)),
    });
  } catch (error) {
    console.error("Error applying budget suggestions:", error);
    res.status(500).json({
      message: "Lỗi khi áp dụng đề xuất ngân sách",
      error: error.message,
    });
  }
};

module.exports = {
  getBudgets,
  upsertBudget,
  updateBudget,
  deleteBudget,
  suggestBudgets,
  applyBudgetSuggestions,
};

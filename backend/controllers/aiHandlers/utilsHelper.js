const mongoose = require("mongoose");
const User = require("../../models/User");
const Transaction = require("../../models/Transaction");
const Category = require("../../models/Category");
const Account = require("../../models/Account");
const Goal = require("../../models/Goal");

class UtilsHelper {
  // Trích xuất số tiền từ text
  extractAmount(text) {
    if (!text) return null;

    // Các pattern để nhận diện số tiền
    const patterns = [
      /(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|million)/i, // X triệu
      /(\d+(?:[.,]\d+)?)\s*(?:nghìn|k|thousand)/i, // X nghìn
      /(\d+(?:[.,]\d+)?)\s*(?:đ|dong|VND|vnđ)/i, // X đồng
      /(\d+(?:[.,]\d+)*)/, // Chỉ số
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseFloat(match[1].replace(/,/g, "."));

        // Xử lý đơn vị
        const fullMatch = match[0].toLowerCase();
        if (
          fullMatch.includes("triệu") ||
          fullMatch.includes("tr") ||
          fullMatch.includes("million")
        ) {
          amount *= 1000000;
        } else if (
          fullMatch.includes("nghìn") ||
          fullMatch.includes("k") ||
          fullMatch.includes("thousand")
        ) {
          amount *= 1000;
        }

        return Math.round(amount);
      }
    }

    return null;
  }

  // Lấy context của user
  async getUserContext(userId) {
    try {
      console.log("Getting user context for userId:", userId);

      // Convert userId to ObjectId if needed
      const userObjectId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;

      // Lấy tất cả categories của user
      const categories = await Category.find({ userId: userObjectId });
      console.log("Found categories:", categories.length);

      // Lấy tất cả accounts của user
      const accounts = await Account.find({ userId: userObjectId });
      console.log("Found accounts:", accounts.length);

      // Lấy một số transaction gần đây để AI hiểu pattern
      const recentTransactions = await Transaction.find({
        userId: userObjectId,
      })
        .sort({ date: -1 })
        .limit(5)
        .populate("categoryId", "name type")
        .populate("accountId", "name type");
      console.log("Found recent transactions:", recentTransactions.length);

      // Đảm bảo data structure đúng format
      const categoryList = categories.map((c) => ({
        name: c.name || "Unnamed Category",
        type: c.type || "CHITIEU",
      }));

      const accountList = accounts.map((a) => ({
        name: a.name || "Unnamed Account",
        type: a.type || "TIENMAT",
        balance: a.balance || 0,
        bankName: a.bankName || null,
      }));

      const transactionList = recentTransactions.map((t) => ({
        name: t.name || "Unnamed Transaction",
        amount: t.amount || 0,
        type: t.type || "CHITIEU",
        category: t.categoryId?.name || "Không có danh mục",
        account: t.accountId?.name || "Không có tài khoản",
        date: t.date
          ? t.date.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));

      const context = {
        categories: categoryList,
        accounts: accountList,
        recentTransactions: transactionList,
        currentDate: new Date().toISOString().split("T")[0],
      };

      console.log("=== USER CONTEXT DETAILS ===");
      console.log("Categories sample:", categoryList.slice(0, 3));
      console.log("Accounts sample:", accountList.slice(0, 3));
      console.log("Transactions sample:", transactionList.slice(0, 2));
      console.log("=== END USER CONTEXT DETAILS ===");

      return context;
    } catch (error) {
      console.error("Error getting user context:", error);
      return {
        categories: [],
        accounts: [],
        recentTransactions: [],
        currentDate: new Date().toISOString().split("T")[0],
      };
    }
  }

  // Hàm helper để parse response từ Gemini
  parseGeminiResponse(responseText) {
    // Loại bỏ các ký tự ```json và ``` ở đầu/cuối chuỗi
    let cleanedJson = responseText.replace(/^```json\s*|```$/gm, "").trim();

    // Xử lý trường hợp có ``` ở giữa text
    cleanedJson = cleanedJson.replace(/```/g, "").trim();

    // Tìm JSON object trong text bằng cách tìm { và }
    const startIndex = cleanedJson.indexOf("{");
    const lastIndex = cleanedJson.lastIndexOf("}");

    if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
      cleanedJson = cleanedJson.substring(startIndex, lastIndex + 1);
    }

    // Xử lý các MongoDB functions không hợp lệ trong JSON
    cleanedJson = cleanedJson.replace(/ISODate\("([^"]+)"\)/g, '"$1"');
    cleanedJson = cleanedJson.replace(/ObjectId\("([^"]+)"\)/g, '"$1"');

    console.log("=== CLEANED JSON ===");
    console.log(cleanedJson);
    console.log("=== END CLEANED JSON ===");

    const parsed = JSON.parse(cleanedJson);

    // Validate required fields
    if (!parsed.intent) {
      throw new Error("Missing intent field in AI response");
    }

    // Validate entities structure
    if (!parsed.entities) {
      parsed.entities = {
        specificAccount: null,
        bankFilter: null,
        categoryFilter: null,
        timeFilter: null,
        amountFilter: null,
        searchTerm: null,
        typeFilter: null,
        statusFilter: null,
      };
    }

    return parsed;
  }

  // Lấy thống kê với filter thời gian từ entities
  async getQuickStatsWithFilter(userId, timeFilter) {
    try {
      console.log("=== GETTING STATS WITH TIME FILTER ===");
      console.log("Time filter:", timeFilter);

      let targetMonth = new Date().getMonth() + 1;
      let targetYear = new Date().getFullYear();

      // Parse timeFilter để xác định tháng/năm cụ thể
      if (timeFilter) {
        const timeInfo = this.parseTimeFilter(timeFilter);
        if (timeInfo) {
          targetMonth = timeInfo.month;
          targetYear = timeInfo.year;
        }
      }

      console.log(`Using month: ${targetMonth}, year: ${targetYear}`);
      return await this.getQuickStats(userId, targetMonth, targetYear);
    } catch (error) {
      console.error("Error getting stats with filter:", error);
      return await this.getQuickStats(userId, null, null);
    }
  }

  // Parse time filter thành month/year
  parseTimeFilter(timeFilter) {
    if (!timeFilter) return null;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const lowerFilter = timeFilter.toLowerCase();

    if (
      lowerFilter.includes("tháng này") ||
      lowerFilter.includes("this month")
    ) {
      return { month: currentMonth, year: currentYear };
    }

    if (
      lowerFilter.includes("tháng trước") ||
      lowerFilter.includes("last month")
    ) {
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      return { month: lastMonth, year: lastYear };
    }

    // Parse "tháng X"
    const monthMatch = lowerFilter.match(/tháng\s*(\d+)/);
    if (monthMatch) {
      const month = parseInt(monthMatch[1]);
      if (month >= 1 && month <= 12) {
        return { month, year: currentYear };
      }
    }

    return null;
  }

  // So sánh chi tiêu giữa các tháng
  async compareMonths(userId, months = 3) {
    try {
      const userObjectId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;

      const now = new Date();
      const monthsData = [];

      // Lấy thống kê của N tháng gần nhất
      for (let i = 0; i < months; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = targetDate.getMonth() + 1;
        const year = targetDate.getFullYear();

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const transactions = await Transaction.find({
          userId: userObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((t) => {
          if (t.type === "THUNHAP") {
            totalIncome += t.amount || 0;
          } else if (t.type === "CHITIEU") {
            totalExpense += t.amount || 0;
          }
        });

        monthsData.push({
          month,
          year,
          monthName: targetDate.toLocaleDateString("vi-VN", {
            month: "long",
            year: "numeric",
          }),
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          transactionCount: transactions.length,
        });
      }

      // Tìm tháng chi tiêu nhiều nhất và ít nhất
      const sortedByExpense = [...monthsData].sort(
        (a, b) => b.totalExpense - a.totalExpense
      );
      const highestExpenseMonth = sortedByExpense[0];
      const lowestExpenseMonth = sortedByExpense[sortedByExpense.length - 1];

      // Tính % thay đổi so với tháng trước
      const currentMonth = monthsData[0];
      const lastMonth = monthsData[1];
      const expenseChange =
        lastMonth.totalExpense > 0
          ? ((currentMonth.totalExpense - lastMonth.totalExpense) /
              lastMonth.totalExpense) *
            100
          : 0;

      // Tạo response text
      let responseText = `📊 <strong>So sánh chi tiêu ${months} tháng gần nhất:</strong>\n\n`;

      monthsData.forEach((data, index) => {
        const isHighest = data.month === highestExpenseMonth.month && data.year === highestExpenseMonth.year;
        const isLowest = data.month === lowestExpenseMonth.month && data.year === lowestExpenseMonth.year;
        const badge = isHighest ? " 🔴" : isLowest ? " 🟢" : "";

        responseText += `${index === 0 ? "📅" : "📆"} <strong>${
          data.monthName
        }${badge}:</strong>\n`;
        responseText += `  💰 Thu nhập: ${data.totalIncome.toLocaleString()}đ\n`;
        
        // Chỉ thêm span khi có class, không thêm nếu rỗng
        if (isHighest) {
          responseText += `  💸 Chi tiêu: <span class="expense">${data.totalExpense.toLocaleString()}đ</span>\n`;
        } else if (isLowest) {
          responseText += `  💸 Chi tiêu: <span class="income">${data.totalExpense.toLocaleString()}đ</span>\n`;
        } else {
          responseText += `  💸 Chi tiêu: ${data.totalExpense.toLocaleString()}đ\n`;
        }
        
        responseText += `  📈 Số dư: <span class="balance ${data.balance >= 0 ? "positive" : "negative"}">${data.balance.toLocaleString()}đ</span>\n`;
        responseText += `  📋 Giao dịch: ${data.transactionCount}\n\n`;
      });

      responseText += `\n🎯 <strong>Kết luận:</strong>\n`;
      responseText += `• Chi tiêu <strong>nhiều nhất</strong>: ${highestExpenseMonth.monthName} với <span class="expense">${highestExpenseMonth.totalExpense.toLocaleString()}đ</span>\n`;
      responseText += `• Chi tiêu <strong>ít nhất</strong>: ${lowestExpenseMonth.monthName} với <span class="income">${lowestExpenseMonth.totalExpense.toLocaleString()}đ</span>\n`;

      if (Math.abs(expenseChange) > 0.01) {
        const changeText = expenseChange > 0 ? "tăng" : "giảm";
        const changeClass = expenseChange > 0 ? "expense" : "income";
        responseText += `• So với tháng trước, chi tiêu <strong>${changeText}</strong> <span class="${changeClass}">${Math.abs(
          expenseChange
        ).toFixed(1)}%</span>\n`;
      }

      return {
        response: responseText,
        action: "COMPARE_MONTHS",
        data: {
          monthsData,
          highestExpenseMonth,
          lowestExpenseMonth,
          expenseChange,
        },
      };
    } catch (error) {
      console.error("Error comparing months:", error);
      return {
        response: "Có lỗi xảy ra khi so sánh các tháng. Vui lòng thử lại.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Lấy thống kê cơ bản
  async getQuickStats(userId, targetMonth = null, targetYear = null) {
    try {
      const userObjectId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;

      const now = new Date();
      const month = targetMonth || now.getMonth() + 1;
      const year = targetYear || now.getFullYear();

      // Tạo filter cho tháng hiện tại
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

      console.log(`Getting stats for ${month}/${year}`);
      console.log("Date range:", startOfMonth, "to", endOfMonth);

      // Lấy giao dịch trong tháng
      const transactions = await Transaction.find({
        userId: userObjectId,
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      }).populate("categoryId", "name");

      // Tính tổng thu chi
      let totalIncome = 0;
      let totalExpense = 0;
      const categoryStats = {};

      transactions.forEach((t) => {
        if (t.type === "THUNHAP") {
          totalIncome += t.amount || 0;
        } else if (t.type === "CHITIEU") {
          totalExpense += t.amount || 0;
        }

        // Thống kê theo danh mục
        const categoryName = t.categoryId?.name || "Không có danh mục";
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = { total: 0, count: 0, type: t.type };
        }
        categoryStats[categoryName].total += t.amount || 0;
        categoryStats[categoryName].count += 1;
      });

      const balance = totalIncome - totalExpense;
      const monthName = new Date(year, month - 1, 1).toLocaleDateString(
        "vi-VN",
        { month: "long", year: "numeric" }
      );

      // Tạo top categories
      const topCategories = Object.entries(categoryStats)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 5)
        .map(
          ([name, data]) =>
            `• ${name}: ${data.total.toLocaleString()}đ (${
              data.count
            } giao dịch)`
        )
        .join("\n");

      let responseText = `📊 <strong>Báo cáo tài chính ${monthName}:</strong>\n\n`;
      responseText += `💰 <strong>Thu nhập:</strong> ${totalIncome.toLocaleString()}đ\n`;
      responseText += `💸 <strong>Chi tiêu:</strong> ${totalExpense.toLocaleString()}đ\n`;
      responseText += `📈 <strong>Số dư:</strong> <span class="balance ${
        balance >= 0 ? "positive" : "negative"
      }">${balance.toLocaleString()}đ</span>\n`;
      responseText += `📋 <strong>Tổng giao dịch:</strong> ${transactions.length}\n\n`;

      if (topCategories) {
        responseText += `🏆 <strong>Top danh mục chi tiêu:</strong>\n${topCategories}`;
      }

      return {
        response: responseText,
        action: "CHAT_RESPONSE",
        data: {
          month,
          year,
          totalIncome,
          totalExpense,
          balance,
          transactionCount: transactions.length,
          categoryStats,
        },
      };
    } catch (error) {
      console.error("Error getting quick stats:", error);
      return {
        response: "Có lỗi xảy ra khi lấy thống kê. Vui lòng thử lại.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Phân tích tài chính thông minh và đưa ra insights
  async analyzeFinancialHealth(userId) {
    try {
      const userObjectId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Lấy data 3 tháng gần nhất
      const monthsData = [];
      for (let i = 0; i < 3; i++) {
        const targetDate = new Date(currentYear, currentMonth - 1 - i, 1);
        const month = targetDate.getMonth() + 1;
        const year = targetDate.getFullYear();

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const transactions = await Transaction.find({
          userId: userObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        }).populate("categoryId", "name type");

        let totalIncome = 0;
        let totalExpense = 0;
        const categoryBreakdown = {};
        const expenseByDay = {};

        transactions.forEach((t) => {
          if (t.type === "THUNHAP") {
            totalIncome += t.amount || 0;
          } else if (t.type === "CHITIEU") {
            totalExpense += t.amount || 0;

            // Category breakdown
            const catName = t.categoryId?.name || "Khác";
            if (!categoryBreakdown[catName]) {
              categoryBreakdown[catName] = 0;
            }
            categoryBreakdown[catName] += t.amount || 0;

            // Daily spending
            const day = t.date.getDate();
            if (!expenseByDay[day]) {
              expenseByDay[day] = 0;
            }
            expenseByDay[day] += t.amount || 0;
          }
        });

        monthsData.push({
          month,
          year,
          monthName: targetDate.toLocaleDateString("vi-VN", {
            month: "long",
          }),
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          savingRate:
            totalIncome > 0
              ? ((totalIncome - totalExpense) / totalIncome) * 100
              : 0,
          transactionCount: transactions.length,
          categoryBreakdown,
          expenseByDay,
        });
      }

      // Lấy goals
      const goals = await Goal.find({
        user: userObjectId,
        archived: false,
      });

      // Lấy accounts
      const accounts = await Account.find({ userId: userObjectId });
      const totalBalance = accounts.reduce(
        (sum, acc) => sum + (acc.initialBalance || acc.balance || 0),
        0
      );

      // Phân tích insights
      const insights = this.generateFinancialInsights(
        monthsData,
        goals,
        totalBalance
      );

      return {
        response: insights.text,
        action: "FINANCIAL_INSIGHTS",
        data: {
          monthsData,
          insights: insights.data,
          goals,
          totalBalance,
        },
      };
    } catch (error) {
      console.error("Error analyzing financial health:", error);
      return {
        response:
          "Có lỗi xảy ra khi phân tích tài chính. Vui lòng thử lại sau.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Generate insights từ data
  generateFinancialInsights(monthsData, goals, totalBalance) {
    const current = monthsData[0];
    const last = monthsData[1];
    const twoMonthsAgo = monthsData[2];

    const insights = {
      warnings: [],
      suggestions: [],
      positive: [],
      habits: [],
    };

    const expenseHistory = monthsData
      .map((month) => month.totalExpense || 0)
      .filter((amount) => amount > 0);
    const incomeHistory = monthsData
      .map((month) => month.totalIncome || 0)
      .filter((amount) => amount > 0);
    const avgMonthlyExpense =
      expenseHistory.length > 0
        ? expenseHistory.reduce((sum, amount) => sum + amount, 0) /
          expenseHistory.length
        : 0;
    const avgMonthlyIncome =
      incomeHistory.length > 0
        ? incomeHistory.reduce((sum, amount) => sum + amount, 0) /
          incomeHistory.length
        : 0;
    const today = new Date();
    const currentDay = today.getDate();
    const daysInCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const projectedExpense =
      currentDay > 0
        ? (current.totalExpense / currentDay) * daysInCurrentMonth
        : current.totalExpense;
    const projectedBalance = avgMonthlyIncome - projectedExpense;
    const recommendedMonthlySaving = Math.max(avgMonthlyIncome * 0.2, 0);

    let responseText = `🔍 <strong>Phân tích tài chính của bạn:</strong>\n\n`;

    // 1. Phân tích xu hướng chi tiêu
    responseText += `📈 <strong>Dự báo cuối tháng:</strong>\n`;
    responseText += `• Chi tiêu dự kiến: ${Math.round(
      projectedExpense
    ).toLocaleString()}đ\n`;
    if (avgMonthlyExpense > 0) {
      const forecastDiff =
        ((projectedExpense - avgMonthlyExpense) / avgMonthlyExpense) * 100;
      const forecastText = forecastDiff >= 0 ? "cao hơn" : "thấp hơn";
      responseText += `• So với trung bình 3 tháng: ${forecastText} ${Math.abs(
        forecastDiff
      ).toFixed(1)}%\n`;

      if (forecastDiff > 15) {
        insights.warnings.push("Dự báo chi tiêu cuối tháng cao hơn trung bình");
      } else if (forecastDiff < -10) {
        insights.positive.push("Dự báo chi tiêu cuối tháng thấp hơn trung bình");
      }
    }
    responseText += `• Số dư dự kiến theo thu nhập trung bình: <span class="balance ${
      projectedBalance >= 0 ? "positive" : "negative"
    }">${Math.round(projectedBalance).toLocaleString()}đ</span>\n\n`;

    const expenseTrend =
      current.totalExpense > last.totalExpense ? "tăng" : "giảm";
    const expenseChangePercent =
      last.totalExpense > 0
        ? Math.abs(
            ((current.totalExpense - last.totalExpense) / last.totalExpense) *
              100
          )
        : 0;

    responseText += `📊 <strong>Xu hướng chi tiêu:</strong>\n`;
    if (expenseTrend === "tăng") {
      responseText += `⚠️ Chi tiêu ${current.monthName} <span class="expense">tăng ${expenseChangePercent.toFixed(1)}%</span> so với tháng trước\n`;
      if (expenseChangePercent > 20) {
        insights.warnings.push("Chi tiêu tăng đột biến");
        responseText += `🚨 <em>Cảnh báo: Chi tiêu tăng quá nhanh!</em>\n`;
      }
    } else {
      responseText += `✅ Chi tiêu ${current.monthName} <span class="income">giảm ${expenseChangePercent.toFixed(1)}%</span> so với tháng trước\n`;
      insights.positive.push("Chi tiêu được kiểm soát tốt");
    }
    responseText += `\n`;

    // 2. Tỷ lệ tiết kiệm
    responseText += `💰 <strong>Tỷ lệ tiết kiệm:</strong>\n`;
    if (current.savingRate > 0) {
      responseText += `✅ Bạn đang tiết kiệm được <span class="income">${current.savingRate.toFixed(1)}%</span> thu nhập\n`;
      if (current.savingRate >= 20) {
        insights.positive.push("Tỷ lệ tiết kiệm tốt");
        responseText += `🎉 <em>Xuất sắc! Tỷ lệ tiết kiệm rất tốt!</em>\n`;
      } else if (current.savingRate < 10) {
        insights.suggestions.push("Nên tăng tỷ lệ tiết kiệm");
        responseText += `💡 <em>Gợi ý: Nên cố gắng tiết kiệm ít nhất 10-20% thu nhập</em>\n`;
      }
    } else {
      responseText += `⚠️ Bạn đang chi tiêu <span class="expense">vượt thu nhập</span> ${Math.abs(current.savingRate).toFixed(1)}%\n`;
      insights.warnings.push("Chi tiêu vượt thu nhập");
      responseText += `🚨 <em>Cảnh báo: Cần giảm chi tiêu hoặc tăng thu nhập!</em>\n`;
    }
    responseText += `\n`;

    // 3. Phân tích danh mục chi tiêu
    const topCategories = Object.entries(current.categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (topCategories.length > 0) {
      responseText += `📋 <strong>Top 3 hạng mục chi nhiều nhất:</strong>\n`;
      topCategories.forEach(([cat, amount], index) => {
        const percent = (amount / current.totalExpense) * 100;
        
        // Chỉ thêm span khi percent > 30, không thêm nếu không
        if (percent > 30) {
          responseText += `${index + 1}. ${cat}: <span class="expense">${amount.toLocaleString()}đ (${percent.toFixed(1)}%)</span>\n`;
          insights.warnings.push(`Chi tiêu quá nhiều cho ${cat}`);
        } else {
          responseText += `${index + 1}. ${cat}: ${amount.toLocaleString()}đ (${percent.toFixed(1)}%)\n`;
        }
      });
      responseText += `\n`;
    }

    // 4. Thói quen chi tiêu
    responseText += `🎯 <strong>Thói quen tài chính:</strong>\n`;

    const spendingDays = Object.keys(current.expenseByDay).length;
    const dailyExpenses = Object.values(current.expenseByDay);
    const avgDailyExpense =
      spendingDays > 0 ? current.totalExpense / spendingDays : 0;
    const maxDailyExpense =
      dailyExpenses.length > 0 ? Math.max(...dailyExpenses) : 0;

    if (maxDailyExpense > avgDailyExpense * 3) {
      insights.habits.push("Có ngày chi tiêu đột biến");
      responseText += `⚠️ Có những ngày bạn chi tiêu gấp 3 lần mức trung bình\n`;
      responseText += `💡 <em>Gợi ý: Hãy lập kế hoạch chi tiêu hàng ngày</em>\n`;
    }

    // Check consistency
    const isConsistent =
      last.totalExpense > 0 &&
      Math.abs(current.totalExpense - last.totalExpense) /
        last.totalExpense <
        0.15;
    if (isConsistent) {
      insights.positive.push("Chi tiêu ổn định");
      responseText += `✅ Chi tiêu hàng tháng khá ổn định và có thể dự đoán\n`;
    }

    // 5. Đề xuất hành động
    responseText += `\n💡 <strong>Đề xuất cải thiện:</strong>\n`;

    if (insights.warnings.length > 0) {
      insights.warnings.forEach((w) => {
        if (w === "Chi tiêu vượt thu nhập") {
          responseText += `• Xem xét cắt giảm chi tiêu không cần thiết\n`;
          responseText += `• Tìm nguồn thu nhập thêm nếu có thể\n`;
        } else if (w.includes("Chi tiêu quá nhiều")) {
          responseText += `• Giảm chi tiêu ở các hạng mục lớn\n`;
        }
      });
    }

    if (current.savingRate > 0 && current.savingRate < 20) {
      responseText += `• Đặt mục tiêu tiết kiệm ít nhất 20% mỗi tháng\n`;
    }

    const activeGoals = goals
      .filter((goal) => goal.status !== "completed")
      .map((goal) => {
        const remaining = Math.max(
          (goal.targetAmount || 0) - (goal.currentAmount || 0),
          0
        );
        const daysLeft = goal.deadline
          ? Math.ceil(
              (new Date(goal.deadline).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          : null;
        const monthsLeft =
          daysLeft && daysLeft > 0 ? Math.max(daysLeft / 30, 1) : null;
        const monthlyNeed = monthsLeft ? remaining / monthsLeft : remaining;

        return {
          name: goal.name,
          remaining,
          daysLeft,
          monthlyNeed,
        };
      })
      .filter((goal) => goal.remaining > 0);

    if (activeGoals.length > 0) {
      responseText += `\n🎯 <strong>Kế hoạch tiết kiệm theo mục tiêu:</strong>\n`;
      activeGoals.slice(0, 3).forEach((goal) => {
        responseText += `• ${goal.name}: còn ${Math.round(
          goal.remaining
        ).toLocaleString()}đ`;
        if (goal.daysLeft && goal.daysLeft > 0) {
          responseText += `, nên dành khoảng ${Math.ceil(
            goal.monthlyNeed
          ).toLocaleString()}đ/tháng trong ${goal.daysLeft} ngày tới`;
        } else {
          responseText += `, nên chia nhỏ thành khoản tiết kiệm hằng tháng phù hợp`;
        }
        responseText += `\n`;
      });

      const totalMonthlyGoalNeed = activeGoals.reduce(
        (sum, goal) => sum + goal.monthlyNeed,
        0
      );

      if (
        recommendedMonthlySaving > 0 &&
        totalMonthlyGoalNeed > recommendedMonthlySaving
      ) {
        insights.suggestions.push(
          "Mục tiêu tiết kiệm hiện tại cần nhiều hơn mức 20% thu nhập trung bình"
        );
        responseText += `• Tổng cần tiết kiệm theo mục tiêu khoảng ${Math.ceil(
          totalMonthlyGoalNeed
        ).toLocaleString()}đ/tháng, cao hơn mức gợi ý 20% thu nhập (${Math.ceil(
          recommendedMonthlySaving
        ).toLocaleString()}đ/tháng). Nên kéo dài hạn hoặc ưu tiên mục tiêu quan trọng nhất.\n`;
      }
    }

    if (goals.length === 0) {
      responseText += `• Tạo mục tiêu tài chính để có động lực tiết kiệm\n`;
    }

    responseText += `• Theo dõi chi tiêu hàng ngày để kiểm soát tốt hơn\n`;

    return {
      text: responseText,
      data: {
        ...insights,
        forecast: {
          avgMonthlyExpense,
          avgMonthlyIncome,
          projectedExpense,
          projectedBalance,
        },
        savingsPlan: activeGoals,
      },
    };
  }
}

module.exports = UtilsHelper;

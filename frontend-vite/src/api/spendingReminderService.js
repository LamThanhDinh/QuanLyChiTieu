// src/api/spendingReminderService.js

import { getTransactions } from "./transactionsService";

// Lấy cài đặt nhắc nhở từ localStorage
export const getSpendingReminderSettings = () => {
  const defaultSettings = {
    enabled: false,
    dailyLimit: 200000,
    monthlyLimit: 5000000,
    reminderTime: "09:00",
    notificationThreshold: 80, // Thông báo khi đạt 80% ngưỡng
    includeGoals: true,
    includeSources: true,
  };

  try {
    const saved = localStorage.getItem("spendingReminderSettings");
    return saved
      ? { ...defaultSettings, ...JSON.parse(saved) }
      : defaultSettings;
  } catch (error) {
    console.error("Error loading spending reminder settings:", error);
    return defaultSettings;
  }
};

// Lưu cài đặt nhắc nhở
export const saveSpendingReminderSettings = (settings) => {
  try {
    localStorage.setItem("spendingReminderSettings", JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Error saving spending reminder settings:", error);
    return false;
  }
};

// Tính toán chi tiêu trong ngày
export const getDailySpending = async () => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const response = await getTransactions(1, 1000, {
      type: "CHITIEU", // ✅ SỬA: Sử dụng "CHITIEU" thay vì "expense"
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    });

    const transactions =
      response.data?.data || response.data?.transactions || [];

    // ✅ Filter chỉ lấy giao dịch chi tiêu thực tế
    const expenseTransactions = transactions.filter(
      (t) => t.type === "CHITIEU"
    );

    const totalSpending = expenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    return {
      total: totalSpending,
      count: expenseTransactions.length,
      transactions: expenseTransactions.slice(0, 5), // Lấy 5 giao dịch gần nhất
    };
  } catch (error) {
    console.error("Error calculating daily spending:", error);
    return { total: 0, count: 0, transactions: [] };
  }
};

// Tính toán chi tiêu trong tháng
export const getMonthlySpending = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const response = await getTransactions(1, 1000, {
      type: "CHITIEU", // ✅ SỬA: Sử dụng "CHITIEU" thay vì "expense"
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    });

    const transactions =
      response.data?.data || response.data?.transactions || [];

    // ✅ Filter chỉ lấy giao dịch chi tiêu thực tế
    const expenseTransactions = transactions.filter(
      (t) => t.type === "CHITIEU"
    );

    const totalSpending = expenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    return {
      total: totalSpending,
      count: expenseTransactions.length,
      averageDaily: totalSpending / now.getDate(),
    };
  } catch (error) {
    console.error("Error calculating monthly spending:", error);
    return { total: 0, count: 0, averageDaily: 0 };
  }
};

// Tạo thông báo nhắc nhở chi tiêu
export const generateSpendingNotifications = async () => {
  const settings = getSpendingReminderSettings();

  if (!settings.enabled) {
    return [];
  }

  const notifications = [];
  const dailySpending = await getDailySpending();
  const monthlySpending = await getMonthlySpending();

  // Kiểm tra ngưỡng chi tiêu hàng ngày
  const dailyPercentage = (dailySpending.total / settings.dailyLimit) * 100;

  if (dailyPercentage >= settings.notificationThreshold) {
    notifications.push({
      id: `daily_spending_${Date.now()}`,
      type: "spending_limit",
      title: "Cảnh báo chi tiêu hàng ngày",
      message: `Bạn đã chi tiêu ${dailyPercentage.toFixed(0)}% ngưỡng hàng ngày (${dailySpending.total.toLocaleString("vi-VN")}₫/${settings.dailyLimit.toLocaleString("vi-VN")}₫)`,
      priority: dailyPercentage >= 100 ? "high" : "medium",
      createdAt: new Date(),
    });
  }

  // Kiểm tra ngưỡng chi tiêu hàng tháng
  const monthlyPercentage =
    (monthlySpending.total / settings.monthlyLimit) * 100;

  if (monthlyPercentage >= settings.notificationThreshold) {
    notifications.push({
      id: `monthly_spending_${Date.now()}`,
      type: "spending_limit",
      title: "Cảnh báo chi tiêu hàng tháng",
      message: `Bạn đã chi tiêu ${monthlyPercentage.toFixed(0)}% ngưỡng hàng tháng (${monthlySpending.total.toLocaleString("vi-VN")}₫/${settings.monthlyLimit.toLocaleString("vi-VN")}₫)`,
      priority: monthlyPercentage >= 100 ? "high" : "medium",
      createdAt: new Date(),
    });
  }

  return notifications;
};

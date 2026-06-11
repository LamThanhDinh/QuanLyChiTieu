// src/utils/testNotifications.js
// Utility để tạo test notifications cho việc debug và demo

export const createTestNotifications = () => {
  const notifications = [
    {
      id: `test_spending_daily_${Date.now()}`,
      type: "spending_limit",
      title: "Cảnh báo chi tiêu hàng ngày",
      message: "Bạn đã chi tiêu 85% ngưỡng hàng ngày (170,000₫/200,000₫)",
      priority: "medium",
      createdAt: new Date(),
    },
    {
      id: `test_spending_monthly_${Date.now() + 1}`,
      type: "spending_limit",
      title: "Cảnh báo chi tiêu hàng tháng",
      message: "Bạn đã chi tiêu 95% ngưỡng hàng tháng (4,750,000₫/5,000,000₫)",
      priority: "high",
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 phút trước
    },
    {
      id: `test_goal_deadline_${Date.now() + 2}`,
      type: "goal_deadline",
      title: "Mục tiêu sắp hết hạn",
      message: 'Mục tiêu "Mua laptop" sẽ hết hạn trong 3 ngày',
      priority: "high",
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 giờ trước
      goalId: "test_goal_id_1",
    },
    {
      id: `test_goal_progress_${Date.now() + 3}`,
      type: "goal_progress",
      title: "Mục tiêu gần hoàn thành",
      message: 'Mục tiêu "Tiết kiệm du lịch" đã hoàn thành 92%',
      priority: "low",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
      goalId: "test_goal_id_2",
    },
  ];

  // Lưu vào localStorage để có thể sử dụng
  localStorage.setItem("testNotifications", JSON.stringify(notifications));
  return notifications;
};

export const clearTestNotifications = () => {
  localStorage.removeItem("testNotifications");
};

export const getTestNotifications = () => {
  try {
    const saved = localStorage.getItem("testNotifications");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading test notifications:", error);
    return [];
  }
};

export const enableTestMode = () => {
  localStorage.setItem("notificationTestMode", "true");
  createTestNotifications();
};

export const disableTestMode = () => {
  localStorage.removeItem("notificationTestMode");
  clearTestNotifications();
};

export const isTestModeEnabled = () => {
  return localStorage.getItem("notificationTestMode") === "true";
};

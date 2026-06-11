// src/hooks/useNotifications.js

import { useState, useEffect, useCallback } from "react";
import {
  getAllNotifications,
  getUnreadNotificationCount,
} from "../api/notificationService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [notificationsData, countData] = await Promise.all([
        getAllNotifications(),
        getUnreadNotificationCount(),
      ]);

      setNotifications(notificationsData);
      setUnreadCount(countData);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động làm mới thông báo mỗi 2 phút (giảm từ 5 phút để cập nhật nhanh hơn)
  useEffect(() => {
    loadNotifications();

    const interval = setInterval(
      () => {
        loadNotifications();
      },
      2 * 60 * 1000 // ✅ Giảm xuống 2 phút để cập nhật nhanh hơn
    );

    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Làm mới thông báo khi có thay đổi chi tiêu hoặc goal actions
  const refreshNotifications = useCallback(() => {
    console.log("🔄 Manually refreshing notifications...");
    loadNotifications();
  }, [loadNotifications]);

  // ✅ THÊM: Function để refresh ngay lập tức khi có goal actions
  const refreshNotificationsImmediate = useCallback(async () => {
    console.log("⚡ Immediate notification refresh triggered");
    await loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    refreshNotificationsImmediate, // ✅ Export immediate refresh function
    loadNotifications,
  };
};

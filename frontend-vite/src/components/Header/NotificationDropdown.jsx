import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationDropdown.module.css";
import { getAllNotifications } from "../../api/notificationService";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "🔵";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "goal_deadline":
        return "⏰";
      case "goal_overdue":
        return "⚠️";
      case "goal_progress":
        return "🎯";
      case "budget_warning":
        return "📊";
      case "budget_exceeded":
        return "💸";
      case "spending_limit":
        return "💰";
      default:
        return "📢";
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.goalId) {
      navigate("/goals");
      onClose();
    } else if (
      notification.type === "budget_warning" ||
      notification.type === "budget_exceeded"
    ) {
      navigate("/budgets");
      onClose();
    } else if (notification.type === "spending_limit") {
      navigate("/transactions");
      onClose();
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getNotificationMeta = (notification) => {
    if (
      (notification.type === "goal_deadline" ||
        notification.type === "goal_overdue") &&
      notification.deadline
    ) {
      return `Hạn chót: ${formatDate(notification.deadline)}`;
    }

    if (notification.type === "goal_progress") {
      return "Theo tiến độ hiện tại";
    }

    if (
      notification.type === "budget_warning" ||
      notification.type === "budget_exceeded"
    ) {
      return `Ngân sách tháng ${notification.month}/${notification.year}`;
    }

    return formatTimeAgo(notification.createdAt);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.notificationDropdown}>
      <div className={styles.header}>
        <h3>Thông báo</h3>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <span>Đang tải...</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className={styles.notificationList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${styles[notification.priority]}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={styles.notificationIcon}>
                  <span className={styles.typeIcon}>
                    {getTypeIcon(notification.type)}
                  </span>
                  <span className={styles.priorityIcon}>
                    {getPriorityIcon(notification.priority)}
                  </span>
                </div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>
                    {notification.title}
                  </div>
                  <div className={styles.notificationMessage}>
                    {notification.message}
                  </div>
                  <div className={styles.notificationTime}>
                    {getNotificationMeta(notification)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔔</div>
            <p>Không có thông báo mới</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className={styles.footer}>
          <button
            className={styles.viewAllButton}
            onClick={() => {
              navigate("/goals");
              onClose();
            }}
          >
            Xem tất cả mục tiêu
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

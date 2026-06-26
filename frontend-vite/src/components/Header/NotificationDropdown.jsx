import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationDropdown.module.css";
import {
  acceptInvitationNotification,
  getAllNotifications,
  markNotificationAsRead,
  rejectInvitationNotification,
} from "../../api/notificationService";

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
      case "family_invitation":
        return "👨‍👩‍👧‍👦";
      case "family_invitation_accepted":
        return "✅";
      case "family_invitation_rejected":
        return "❌";
      default:
        return "📢";
    }
  };

  const isFamilyNotification = (notification) =>
    notification?.type?.startsWith("family_");

  const isPendingFamilyInvitation = (notification) =>
    notification?.type === "family_invitation" &&
    notification?.invitationId &&
    notification?.invitationStatus !== "accepted" &&
    notification?.invitationStatus !== "rejected";

  const navigateByNotification = (notification) => {
    if (notification?.goalId) {
      navigate("/goals");
    } else if (
      notification?.type === "budget_warning" ||
      notification?.type === "budget_exceeded"
    ) {
      navigate("/budgets");
    } else if (notification?.type === "spending_limit") {
      navigate("/transactions");
    } else if (isFamilyNotification(notification)) {
      navigate("/families");
    } else {
      navigate("/goals");
    }

    onClose();
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    }
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

  const handleNotificationClick = async (notification) => {
    try {
      if (notification?._id && !notification.read) {
        await markNotificationAsRead(notification._id);
      }
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
    navigateByNotification(notification);
  };

  const handleInvitationResponse = async (event, notification, action) => {
    event.stopPropagation();
    if (!notification?.invitationId) return;

    try {
      if (action === "accept") {
        await acceptInvitationNotification(notification.invitationId);
      } else {
        await rejectInvitationNotification(notification.invitationId);
      }
      await loadNotifications();
    } catch (error) {
      console.error("Error responding family invitation:", error);
    }
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
                  {isPendingFamilyInvitation(notification) && (
                    <div className={styles.notificationActions}>
                      <button
                        type="button"
                        className={styles.acceptButton}
                        onClick={(event) =>
                          handleInvitationResponse(event, notification, "accept")
                        }
                      >
                        Chấp nhận
                      </button>
                      <button
                        type="button"
                        className={styles.rejectButton}
                        onClick={(event) =>
                          handleInvitationResponse(event, notification, "reject")
                        }
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
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
            onClick={() => navigateByNotification(notifications[0])}
          >
            Mở trang liên quan
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .populate("familyId", "name")
      .populate("invitationId", "status")
      .sort({ read: 1, createdAt: -1 })
      .limit(50);

    res.json({
      data: notifications.map((notification) => ({
        id: notification._id,
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        read: notification.read,
        createdAt: notification.createdAt,
        familyId: notification.familyId?._id || notification.familyId,
        familyName: notification.familyId?.name,
        invitationId: notification.invitationId?._id || notification.invitationId,
        invitationStatus: notification.invitationId?.status,
        metadata: notification.metadata,
      })),
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông báo" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    res.json({ message: "Đã đánh dấu đã đọc", notification });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật thông báo" });
  }
};

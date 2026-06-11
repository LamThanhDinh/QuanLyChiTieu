const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Lấy danh sách tất cả users (không bao gồm password)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Không trả về password
      .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng.",
      error: error.message,
    });
  }
};

// Lấy thông tin chi tiết một user
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin người dùng.",
      error: error.message,
    });
  }
};

// Cập nhật thông tin user (không bao gồm password)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, fullname, email, role } = req.body;

    // Kiểm tra user có tồn tại không
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    // Kiểm tra username đã tồn tại chưa (nếu thay đổi)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Tên tài khoản đã tồn tại.",
        });
      }
      user.username = username;
    }

    // Kiểm tra email đã tồn tại chưa (nếu thay đổi)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email đã được sử dụng.",
        });
      }
      user.email = email;
    }

    // Cập nhật các trường khác
    if (fullname) user.fullname = fullname;
    if (role && (role === "user" || role === "admin")) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công.",
      data: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật người dùng.",
      error: error.message,
    });
  }
};

// Xóa user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Không cho phép admin tự xóa chính mình
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể xóa chính mình.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công.",
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa người dùng.",
      error: error.message,
    });
  }
};

// Đổi mật khẩu cho user
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công.",
    });
  } catch (error) {
    console.error("Error in resetUserPassword:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đặt lại mật khẩu.",
      error: error.message,
    });
  }
};

// Thống kê tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    // Tính user thường = tổng users - admins
    const totalRegularUsers = totalUsers - totalAdmins;

    // Lấy 5 users mới nhất
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalRegularUsers,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê.",
      error: error.message,
    });
  }
};

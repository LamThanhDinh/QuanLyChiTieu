import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserShield,
  FaUser,
  FaEdit,
  FaTrash,
  FaKey,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import HeaderCard from "../components/Common/HeaderCard";
import adminService from "../api/adminService";
import { getGreeting, getFullDate } from "../utils/timeHelpers";
import styles from "../styles/AdminDashboard.module.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const [editForm, setEditForm] = useState({
    username: "",
    fullname: "",
    email: "",
    role: "user",
  });

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserProfile(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email &&
            user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllUsers(),
      ]);

      setStats(statsData.data);
      setUsers(usersData.data);
      setFilteredUsers(usersData.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      alert(
        error.message || "Lỗi khi tải dữ liệu. Bạn có thể không có quyền admin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      fullname: user.fullname,
      email: user.email || "",
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(selectedUser._id, editForm);
      alert("Cập nhật người dùng thành công!");
      setShowEditModal(false);
      fetchDashboardData();
    } catch (error) {
      alert(error.message || "Lỗi khi cập nhật người dùng");
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(selectedUser._id);
      alert("Xóa người dùng thành công!");
      setShowDeleteModal(false);
      fetchDashboardData();
    } catch (error) {
      alert(error.message || "Lỗi khi xóa người dùng");
    }
  };

  const handlePasswordClick = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      await adminService.resetUserPassword(selectedUser._id, newPassword);
      alert("Đặt lại mật khẩu thành công!");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (error) {
      alert(error.message || "Lỗi khi đặt lại mật khẩu");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <Navbar />
        <div className={styles.pageWrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.contentContainer}>
          {/* Header Card */}
          <HeaderCard
            gridIcon="👥"
            gridTitle={`${getGreeting()}, ${userProfile?.fullname || "Admin"}!`}
            gridSubtitle="Quản lý tài khoản người dùng trong hệ thống"
            gridInfo={
              <div className={styles.headerInfo}>
                <span className={styles.contextText}>
                  📊 Phân tích chi tiết dữ liệu người dùng
                </span>
                <span className={styles.miniStats}>{getFullDate()}</span>
              </div>
            }
          />

          {/* Stats Overview */}
          {stats && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: "#e3f2fd" }}>
                  <FaUsers style={{ color: "#1976d2" }} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Tổng Người Dùng</div>
                  <div className={styles.statValue}>{stats.totalUsers}</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: "#f3e5f5" }}>
                  <FaUserShield style={{ color: "#7b1fa2" }} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Admin</div>
                  <div className={styles.statValue}>{stats.totalAdmins}</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: "#e8f5e9" }}>
                  <FaUser style={{ color: "#388e3c" }} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>User Thường</div>
                  <div className={styles.statValue}>{stats.totalRegularUsers}</div>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm kiếm theo username, tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className={styles.clearButton}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className={styles.tableContainer}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Họ Tên</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Ngày Tạo</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className={styles.usernameCell}>
                        {user.role === "admin" && (
                          <FaUserShield className={styles.adminIcon} />
                        )}
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td>{user.fullname}</td>
                    <td>{user.email || <span className={styles.noData}>Chưa có</span>}</td>
                    <td>
                      <span
                        className={`${styles.roleBadge} ${
                          user.role === "admin" ? styles.adminBadge : styles.userBadge
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className={styles.dateCell}>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleEditClick(user)}
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handlePasswordClick(user)}
                          className={`${styles.actionBtn} ${styles.keyBtn}`}
                          title="Đặt lại mật khẩu"
                        >
                          <FaKey />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className={styles.emptyState}>
                <FaSearch className={styles.emptyIcon} />
                <p>Không tìm thấy người dùng nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                <FaEdit /> Chỉnh Sửa Người Dùng
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className={styles.closeBtn}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Họ Tên</label>
                <input
                  type="text"
                  value={editForm.fullname}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullname: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={styles.cancelBtn}
                >
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={`${styles.modalHeader} ${styles.deleteHeader}`}>
              <h2>
                <FaTrash /> Xác Nhận Xóa
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.closeBtn}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <strong>{selectedUser?.username}</strong>?
              </p>
              <p className={styles.warningText}>Hành động này không thể hoàn tác!</p>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={styles.cancelBtn}
                >
                  Hủy
                </button>
                <button onClick={handleDeleteUser} className={styles.deleteSubmitBtn}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                <FaKey /> Đặt Lại Mật Khẩu
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className={styles.closeBtn}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className={styles.modalBody}>
              <div className={styles.infoBox}>
                Đặt lại mật khẩu cho: <strong>{selectedUser?.username}</strong>
              </div>
              <div className={styles.formGroup}>
                <label>Mật Khẩu Mới (tối thiểu 6 ký tự)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Nhập mật khẩu mới..."
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className={styles.cancelBtn}
                >
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Đặt Lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

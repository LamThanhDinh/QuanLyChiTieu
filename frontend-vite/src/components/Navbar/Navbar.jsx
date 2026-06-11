import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Danh sách các mục điều hướng
  // Quan trọng: 'path' phải khớp với các định nghĩa route trong App.jsx của bạn
  const navigationItems = [
    { name: "Trang chủ", path: "/homepage" },
    { name: "Danh mục", path: "/categories" },
    { name: "Tài khoản", path: "/accounts" },
    { name: "Mục tiêu", path: "/goals" },
    { name: "Giao dịch", path: "/transactions" },
    { name: "Thống kê", path: "/statistics" },
    // { name: "Cá nhân", path: "/personinfo" },
  ];

  // Thêm menu Admin nếu user có role admin
  if (userRole === "admin") {
    navigationItems.push({ name: "Quản trị", path: "/admin" });
  }

  return (
    <nav className={styles.navbarContainer}>
      <ul className={styles.navList}>
        {navigationItems.map((item) => (
          <li key={item.name} className={styles.navItem}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import logoSrc from "../../assets/login/logo2.png";
import avatar1 from "../../assets/avatars/cat1.png";
import avatar2 from "../../assets/avatars/cat2.png";
import avatar3 from "../../assets/avatars/cat3.png";
import { getAvatarUrl } from "../../api/profileService";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

const animalAvatars = [avatar1, avatar2, avatar3];

const Header = () => {
  const [userInfo, setUserInfo] = useState({ fullname: "User", avatar: "" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (err) {
        console.error("Lỗi đọc user:", err);
      }
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fallbackAvatar = useMemo(() => {
    const index = Math.floor(Math.random() * animalAvatars.length);
    return animalAvatars[index];
  }, []);

  // Sửa logic để avatar có thể là đường dẫn từ server
  const finalAvatar = userInfo.avatar
    ? getAvatarUrl(userInfo.avatar)
    : fallbackAvatar;

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logoContainer}>
        <img src={logoSrc} alt="Logo" className={styles.logo} />
      </div>
      <div className={styles.userSection}>
        <div className={styles.notificationContainer} ref={notificationRef}>
          <div
            className={styles.notificationIcon}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C13.1 2 14 2.9 14 4V4.29C16.89 5.15 19 7.83 19 11V16L21 18V19H3V18L5 16V11C5 7.83 7.11 5.15 10 4.29V4C10 2.9 10.9 2 12 2ZM12 22C13.11 22 14 21.11 14 20H10C10 21.11 10.89 22 12 22Z"
                fill="currentColor"
              />
            </svg>
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>
        <div
          className={styles.userInfo}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          ref={dropdownRef}
        >
          <img
            src={finalAvatar}
            alt={`${userInfo.fullname}'s avatar`}
            className={styles.avatar}
          />
          <span className={styles.userName}>{userInfo.fullname}</span>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <Link to="/profile" className={styles.dropdownItem}>
                Trang cá nhân
              </Link>
              <div onClick={handleLogout} className={styles.dropdownItem}>
                Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

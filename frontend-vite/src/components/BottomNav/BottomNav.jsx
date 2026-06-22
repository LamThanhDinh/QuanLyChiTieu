import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./BottomNav.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faExchangeAlt,
  faLayerGroup,
  faBullseye,
  faWallet,
  faRedoAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { name: "Trang chủ", path: "/homepage", icon: faHome },
  { name: "Giao dịch", path: "/transactions", icon: faExchangeAlt },
  { name: "Danh mục", path: "/categories", icon: faLayerGroup },
  { name: "Mục tiêu", path: "/goals", icon: faBullseye },
  { name: "Ngân sách", path: "/budgets", icon: faWallet },
  { name: "Định kỳ", path: "/recurring-transactions", icon: faRedoAlt },
  { name: "Cá nhân", path: "/profile", icon: faUser },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className={styles.bottomNav} id="bottom-navigation">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            aria-label={item.name}
          >
            <div className={styles.iconWrapper}>
              <FontAwesomeIcon icon={item.icon} className={styles.navIcon} />
              {isActive && <span className={styles.activeIndicator} />}
            </div>
            <span className={styles.navLabel}>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;

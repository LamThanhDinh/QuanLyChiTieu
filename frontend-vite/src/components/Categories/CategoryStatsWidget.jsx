// src/components/Categories/CategoryStatsWidget.jsx
import React from "react";
import styles from "./CategoryStatsWidget.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowUp, 
  faArrowDown, 
  faChartBar,
  faStar,
  faEye,
  faLayerGroup
} from "@fortawesome/free-solid-svg-icons";
import { getIconObject } from "../../utils/iconMap";

const CategoryStatsWidget = ({ 
  categoryStats = {
    totalCategories: 0,
    incomeCategories: 0,
    expenseCategories: 0,
    usedCategories: 0,
    mostUsedCategory: null
  },
  activeFilter = "ALL", // Thêm prop activeFilter
  onFilterChange = () => {} // Thêm prop onFilterChange
}) => {
  const {
    totalCategories,
    incomeCategories, 
    expenseCategories,
    usedCategories,
    mostUsedCategory
  } = categoryStats;

  const usagePercentage = totalCategories > 0 
    ? Math.round((usedCategories / totalCategories) * 100) 
    : 0;

  // Helper function để convert icon name thành emoji
  const getIconEmoji = (iconName) => {
    // Mapping từ icon FontAwesome name thành emoji
    const iconToEmojiMap = {
      'fa-money-bill-wave': '💰',
      'fa-gift': '🎁',
      'fa-hand-holding-usd': '�',
      'fa-piggy-bank': '🐷',
      'fa-utensils': '🍽️',
      'fa-shopping-cart': '🛒',
      'fa-car': '🚗',
      'fa-gas-pump': '⛽',
      'fa-bus': '�',
      'fa-train': '🚆',
      'fa-plane': '✈️',
      'fa-home': '�',
      'fa-file-invoice-dollar': '📄',
      'fa-bolt': '⚡',
      'fa-wifi': '📶',
      'fa-tools': '🔧',
      'fa-tshirt': '👕',
      'fa-store': '🏪',
      'fa-mobile-alt': '📱',
      'fa-heartbeat': '❤️',
      'fa-hospital': '🏥',
      'fa-book': '�',
      'fa-graduation-cap': '🎓',
      'fa-film': '🎬',
      'fa-music': '🎵',
      'fa-gamepad': '🎮',
      'fa-glass-cheers': '🥂',
      'fa-paw': '🐾',
      'fa-tree': '🌳',
      'fa-seedling': '🌱',
      'fa-receipt': '🧾',
      'fa-wallet': '👛',
      'fa-credit-card': '💳',
      'fa-landmark': '🏛️',
      'fa-bank': '🏦'
    };
    
    return iconToEmojiMap[iconName] || "📊";
  };

  // Helper function để format số tiền
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount?.toLocaleString?.() || amount;
  };

  // Handler cho filter click
  const handleStatClick = (filterType) => {
    onFilterChange(filterType);
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faChartBar} className={styles.headerIcon} />
        </div>
        <h3 className={styles.title}>Thống kê danh mục</h3>
      </div>

      <div className={styles.content}>
        {/* Stats Row - Layout ngang 1 hàng */}
        <div className={styles.statsRowHorizontal}>
          <div 
            className={`${styles.statItemHorizontal} ${activeFilter === "ALL" ? styles.active : ""}`}
            onClick={() => handleStatClick("ALL")}
          >
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{totalCategories}</div>
              <div className={styles.statLabel}>Tổng</div>
            </div>
          </div>

          <div 
            className={`${styles.statItemHorizontal} ${activeFilter === "THUNHAP" ? styles.active : ""}`}
            onClick={() => handleStatClick("THUNHAP")}
          >
            <div className={`${styles.statIcon} ${styles.income}`}>
              <FontAwesomeIcon icon={faArrowUp} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{incomeCategories}</div>
              <div className={styles.statLabel}>Thu</div>
            </div>
          </div>

          <div 
            className={`${styles.statItemHorizontal} ${activeFilter === "CHITIEU" ? styles.active : ""}`}
            onClick={() => handleStatClick("CHITIEU")}
          >
            <div className={`${styles.statIcon} ${styles.expense}`}>
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{expenseCategories}</div>
              <div className={styles.statLabel}>Chi</div>
            </div>
          </div>

          <div className={`${styles.statItemHorizontal} ${styles.alwaysHighlight}`}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faEye} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{usagePercentage}%</div>
              <div className={styles.statLabel}>Dùng</div>
            </div>
          </div>
        </div>

        {/* Progress bar cho tỷ lệ sử dụng - compact */}
        <div className={styles.usageProgressCompact}>
          <div className={styles.progressInfo}>
            <span className={styles.progressText}>Sử dụng: {usedCategories}/{totalCategories}</span>
            <span className={styles.progressPercent}>{usagePercentage}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* Danh mục phổ biến - inline */}
        {mostUsedCategory && (
          <div className={styles.mostUsedInline}>
            <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
            <FontAwesomeIcon 
              icon={getIconObject(mostUsedCategory.icon)} 
              className={styles.categoryIcon}
            />
            <span className={styles.categoryName}>{mostUsedCategory.name}</span>
            <span className={styles.usageCount}>({formatCurrency(mostUsedCategory.usageCount)})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryStatsWidget;

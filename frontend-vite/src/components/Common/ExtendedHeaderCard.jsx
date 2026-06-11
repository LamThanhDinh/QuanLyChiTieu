import React from "react";
import styles from "./ExtendedHeaderCard.module.css";
import HeaderCard from "./HeaderCard";

/**
 * ExtendedHeaderCard - Component mở rộng từ HeaderCard
 * Hỗ trợ thêm các section tùy chỉnh trong khi vẫn kế thừa styling từ HeaderCard
 * 
 * Props:
 * - Tất cả props của HeaderCard (title, action, filter, extra, className)
 * - customSections: Array các section tùy chỉnh sẽ được render sau header
 * - layout: 'default' | 'extended' | 'grid' - layout type
 */
const ExtendedHeaderCard = ({
  // HeaderCard props
  title,
  action,
  filter,
  extra,
  className = "",
  
  // Extended props
  customSections = [],
  layout = "default",
  children,
  
  ...props
}) => {
  // Nếu layout default và không có customSections, dùng HeaderCard gốc
  if (layout === "default" && customSections.length === 0 && !children) {
    return (
      <HeaderCard
        title={title}
        action={action}
        filter={filter}
        extra={extra}
        className={className}
        {...props}
      />
    );
  }

  // Grid layout 3x2 - dành riêng cho CategoryPageHeader
  if (layout === "grid") {
    return (
      <div className={`${styles.extendedHeaderCard} ${styles.gridLayout} ${className}`}>
        {/* Row 1, Col 1: Title */}
        <div className={styles.gridTitle}>
          {title}
        </div>
        
        {/* Row 1-2, Col 2: Extra widget (spans 2 rows) */}
        {extra && (
          <div className={styles.gridExtra}>
            {extra}
          </div>
        )}
        
        {/* Row 2, Col 1: Filter */}
        {filter && (
          <div className={styles.gridFilter}>
            {filter}
          </div>
        )}
        
        {/* Row 3, Col 1-2: Action (spans 2 columns) */}
        {action && (
          <div className={styles.gridAction}>
            {action}
          </div>
        )}
      </div>
    );
  }

  // Extended layout với customSections (layout cũ)
  return (
    <div className={`${styles.extendedHeaderCard} ${className}`}>
      {/* Dòng 1: Title và extra (không có action) */}
      <div className={styles.titleSection}>
        <div className={styles.title}>{title}</div>
        {extra && <div className={styles.extra}>{extra}</div>}
        {filter && <div className={styles.filter}>{filter}</div>}
      </div>
      
      {/* Dòng 2: Custom sections hoặc Children content */}
      {customSections.length > 0 && (
        <div className={styles.customSections}>
          {customSections.map((section, index) => (
            <div key={index} className={styles.customSection}>
              {section}
            </div>
          ))}
        </div>
      )}
      
      {children && (
        <div className={styles.childrenContent}>
          {children}
        </div>
      )}
      
      {/* Dòng 3: Action button căn phải */}
      {action && (
        <div className={styles.actionSection}>
          {action}
        </div>
      )}
    </div>
  );
};

export default ExtendedHeaderCard;

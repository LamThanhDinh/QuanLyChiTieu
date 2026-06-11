// src/components/Common/PageContentContainer.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DateRangeNavigator from "./DateRangeNavigator";
import styles from "./PageContentContainer.module.css";

const PageContentContainer = ({
  title,
  titleIcon,
  titleIconColor = "#3f51b5",
  showDateFilter = true,
  dateProps,
  headerExtra,
  children,
  className = "",
  customLayout = false
}) => {
  return (
    <div className={`${styles.contentContainer} ${className}`}>
      {/* Hàng 1: Header với title và controls */}
      <div className={styles.headerRow}>
        <div className={styles.titleSection}>
          {titleIcon && (
            <FontAwesomeIcon 
              icon={titleIcon} 
              className={styles.titleIcon}
              style={{ color: titleIconColor }}
            />
          )}
          <h2 className={styles.title}>{title}</h2>
        </div>
        
        <div className={styles.controlsSection}>
          {headerExtra}
          {showDateFilter && dateProps && (
            <DateRangeNavigator {...dateProps} />
          )}
        </div>
      </div>
      
      {/* Hàng 2+: Nội dung chính */}
      <div className={customLayout ? styles.customContentLayout : styles.defaultContentLayout}>
        {children}
      </div>
    </div>
  );
};

export default PageContentContainer;

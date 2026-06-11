import React from "react";
import styles from "./HeaderCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

// Nâng cấp HeaderCard: nhận props cho từng ô grid, tự layout và style đồng nhất
const HeaderCard = ({
  gridIcon, // icon riêng
  gridTitle, // title riêng
  gridSubtitle, // subtitle riêng (optional)
  gridStats,
  gridInfo,
  gridAction,
  className = "",
}) => {
  return (
    <div className={`${styles.headerCard} ${styles.gridLayout} ${className}`}>
      <div className={styles.gridItem1_1}>
        {/* Icon và text trong cùng container, sắp xếp ngang */}
        <span className={styles.greetingIcon}>
          {gridIcon ? gridIcon : <FontAwesomeIcon icon={faCalendarAlt} />}
        </span>
        <div className={styles.greetingText}>
          <span className={styles.titleText}>{gridTitle}</span>
          {gridSubtitle && (
            <span className={styles.subtitle}>{gridSubtitle}</span>
          )}
        </div>
      </div>
      <div className={styles.gridItem1_2}>{gridStats}</div>
      <div className={styles.gridItem2_1}>{gridInfo}</div>
      <div className={styles.gridItem2_2}>{gridAction}</div>
    </div>
  );
};

export default HeaderCard;

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faChartBar } from "@fortawesome/free-solid-svg-icons";
import styles from "./LoadingState.module.css";

const LoadingState = ({
  message = "Đang tải dữ liệu...",
  showChart = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.loadingContent}>
        <div className={styles.iconContainer}>
          {showChart ? (
            <FontAwesomeIcon icon={faChartBar} className={styles.chartIcon} />
          ) : (
            <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
          )}
        </div>
        <h3 className={styles.loadingTitle}>{message}</h3>
        <p className={styles.loadingSubtitle}>Vui lòng chờ trong giây lát...</p>
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;

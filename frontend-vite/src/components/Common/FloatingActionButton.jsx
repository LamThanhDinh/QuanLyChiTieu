import React from "react";
import styles from "./FloatingActionButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const FloatingActionButton = ({ onClick, icon, ariaLabel = "Thêm giao dịch" }) => {
  return (
    <button
      className={styles.fab}
      onClick={onClick}
      aria-label={ariaLabel}
      id="floating-action-button"
    >
      <FontAwesomeIcon icon={icon || faPlus} className={styles.fabIcon} />
    </button>
  );
};

export default FloatingActionButton;

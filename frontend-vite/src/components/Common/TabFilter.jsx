import React from "react";
import styles from "./TabFilter.module.css";

const TabFilter = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className={styles.tabContainer}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tabButton} ${
            activeTab === tab.key ? styles.active : ""
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabFilter;

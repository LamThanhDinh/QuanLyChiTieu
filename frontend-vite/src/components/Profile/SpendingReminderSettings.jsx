import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faChevronDown,
  faChevronUp,
  faFlask,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./SpendingReminderSettings.module.css";
import {
  getSpendingReminderSettings,
  saveSpendingReminderSettings,
} from "../../api/spendingReminderService";
import {
  enableTestMode,
  disableTestMode,
  isTestModeEnabled,
} from "../../utils/testNotifications";

const SpendingReminderSettings = ({ isExpanded, onToggle }) => {
  const [settings, setSettings] = useState({
    enabled: false,
    dailyLimit: 200000,
    monthlyLimit: 5000000,
    reminderTime: "09:00",
    notificationThreshold: 80,
    includeGoals: true,
    includeSources: true,
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    loadSettings();
    setTestMode(isTestModeEnabled());
  }, []);

  // Listen for changes in main reminder toggle
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "spendingReminderEnabled") {
        loadSettings();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loadSettings = () => {
    const savedSettings = getSpendingReminderSettings();

    // Also check the main reminder enabled flag
    const mainReminderEnabled = localStorage.getItem("spendingReminderEnabled");
    if (mainReminderEnabled !== null) {
      savedSettings.enabled = JSON.parse(mainReminderEnabled);
    }

    setSettings(savedSettings);
  };

  const handleSaveSettings = () => {
    const success = saveSpendingReminderSettings(settings);
    if (success) {
      // Also update the main reminder enabled flag
      localStorage.setItem(
        "spendingReminderEnabled",
        JSON.stringify(settings.enabled)
      );

      setMessage({
        text: "Đã lưu cài đặt nhắc nhở chi tiêu thành công!",
        type: "success",
      });
    } else {
      setMessage({
        text: "Có lỗi xảy ra khi lưu cài đặt!",
        type: "error",
      });
    }

    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTestModeToggle = () => {
    if (testMode) {
      disableTestMode();
      setTestMode(false);
      setMessage({
        text: "Đã tắt chế độ test. Thông báo thật sẽ được hiển thị.",
        type: "info",
      });
    } else {
      enableTestMode();
      setTestMode(true);
      setMessage({
        text: "Đã bật chế độ test. Thông báo mẫu sẽ được hiển thị để demo.",
        type: "success",
      });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const parseCurrency = (value) => {
    return parseInt(value.replace(/[.,]/g, "")) || 0;
  };

  return (
    <div className={styles.reminderContainer}>
      <div className={styles.reminderHeader} onClick={onToggle}>
        <span className={styles.reminderLabel}>
          <FontAwesomeIcon icon={faBell} /> Cài đặt nhắc nhở chi tiêu
        </span>
        <FontAwesomeIcon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className={styles.chevronIcon}
        />
      </div>

      {isExpanded && (
        <div className={styles.reminderContent}>
          {/* Message display */}
          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          {/* Ngưỡng chi tiêu hàng ngày và tháng - Inline */}
          <div className={styles.settingGroupInline}>
            <div>
              <label className={styles.settingLabel}>
                Ngưỡng chi tiêu hàng ngày (VNĐ)
              </label>
              <input
                type="text"
                className={styles.settingInput}
                value={formatCurrency(settings.dailyLimit)}
                onChange={(e) =>
                  handleInputChange("dailyLimit", parseCurrency(e.target.value))
                }
                placeholder="200,000"
              />
            </div>
            <div>
              <label className={styles.settingLabel}>
                Ngưỡng chi tiêu hàng tháng (VNĐ)
              </label>
              <input
                type="text"
                className={styles.settingInput}
                value={formatCurrency(settings.monthlyLimit)}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyLimit",
                    parseCurrency(e.target.value)
                  )
                }
                placeholder="5,000,000"
              />
            </div>
          </div>

          {/* Giờ thông báo và checkbox options - Inline */}
          <div className={styles.settingGroupInline}>
            <div>
              <label className={styles.settingLabel}>
                Giờ thông báo hàng ngày
              </label>
              <input
                type="time"
                className={styles.settingInput}
                value={settings.reminderTime}
                onChange={(e) =>
                  handleInputChange("reminderTime", e.target.value)
                }
              />
            </div>
            <div>
              <label className={styles.settingLabel}>Tùy chọn thông báo</label>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="includeGoals"
                  className={styles.settingCheckbox}
                  checked={settings.includeGoals}
                  onChange={(e) =>
                    handleInputChange("includeGoals", e.target.checked)
                  }
                />
                <label htmlFor="includeGoals" className={styles.checkboxLabel}>
                  Mục tiêu
                </label>
              </div>
              <div
                className={styles.checkboxGroup}
                style={{ marginTop: "8px" }}
              >
                <input
                  type="checkbox"
                  id="includeSources"
                  className={styles.settingCheckbox}
                  checked={settings.includeSources}
                  onChange={(e) =>
                    handleInputChange("includeSources", e.target.checked)
                  }
                />
                <label
                  htmlFor="includeSources"
                  className={styles.checkboxLabel}
                >
                  Nguồn tiền
                </label>
              </div>
            </div>
          </div>

          {/* Ngưỡng phần trăm thông báo */}
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              Thông báo khi đạt (% ngưỡng): {settings.notificationThreshold}%
            </label>
            <input
              type="range"
              className={styles.settingSlider}
              min="50"
              max="100"
              step="5"
              value={settings.notificationThreshold}
              onChange={(e) =>
                handleInputChange(
                  "notificationThreshold",
                  parseInt(e.target.value)
                )
              }
            />
            <div className={styles.sliderLabels}>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Test Mode */}
          <div className={styles.settingGroup}>
            <div className={styles.testModeContainer}>
              <div className={styles.testModeHeader}>
                <FontAwesomeIcon icon={faFlask} className={styles.testIcon} />
                <span className={styles.settingLabel}>
                  Chế độ test thông báo
                </span>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={testMode}
                  onChange={handleTestModeToggle}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
            <p className={styles.testModeDescription}>
              {testMode
                ? "🧪 Đang hiển thị thông báo mẫu để demo. Tắt để xem thông báo thật."
                : "Bật để xem thông báo mẫu (dùng để test giao diện)"}
            </p>
          </div>

          {/* Nút lưu */}
          <div className={styles.saveButtonContainer}>
            <button className={styles.saveButton} onClick={handleSaveSettings}>
              Lưu cài đặt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingReminderSettings;

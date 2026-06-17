import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../../hooks/useTheme";
import SpendingReminderSettings from "./SpendingReminderSettings";
import styles from "./Settings.module.css";

const Settings = ({
  // Dark mode và reminder settings
  reminder,
  setReminder,

  // Import/Export handlers
  handleExportDataRequest,
  fileImportRef,
  handleImportFileChange,
  importedData,
  handleImportDataRequest,
  isImporting,

  // Excel handlers
  handleExportExcelRequest,
  fileImportExcelRef,
  handleImportExcelFileChange,
  importedExcelFile,
  handleImportExcelDataRequest,
  isImportingExcel,

  // Logout handler
  handleLogout,

  // Messages
  message,
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isReminderExpanded, setIsReminderExpanded] = useState(false);
  const [exportFormat, setExportFormat] = useState("json"); // json or excel
  const [importFormat, setImportFormat] = useState("json"); // json or excel

  // Debug log to check if functions are passed correctly
  console.log("Settings component props:", {
    handleExportDataRequest: typeof handleExportDataRequest,
    handleImportFileChange: typeof handleImportFileChange,
    handleImportDataRequest: typeof handleImportDataRequest,
    handleLogout: typeof handleLogout,
    fileImportRef: !!fileImportRef,
  });

  return (
    <>
      <h3 className={styles.cardTitle}>
        <FontAwesomeIcon icon={faUserCog} /> Cài đặt
      </h3>

      {/* Message display */}
      {message?.text && (
        <div
          className={`${styles.message} ${
            message.type === "success"
              ? styles.messageSuccess
              : message.type === "error"
              ? styles.messageError
              : styles.messageInfo
          }`}
        >
          {message.text}
        </div>
      )}

      <div className={styles.settingsContent}>
        {/* Dark Mode Toggle */}
        <div className={styles.settingsItem}>
          <span className={styles.settingsLabel}>Chế độ tối (Dark Mode)</span>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={isDarkMode}
              onChange={toggleTheme}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>

        {/* Reminder Toggle */}
        <div className={styles.settingsItem}>
          <span className={styles.settingsLabel}>Nhắc nhở chi tiêu</span>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>

        {/* Spending Reminder Settings - Expandable */}
        <SpendingReminderSettings
          isExpanded={isReminderExpanded}
          onToggle={() => setIsReminderExpanded(!isReminderExpanded)}
        />

        {/* Data Import/Export Section */}
        <div className={styles.dataSection}>
          <label className={styles.sectionLabel}>Xuất/nhập dữ liệu</label>
          
          {/* Export Format Selection */}
          <div className={styles.formatSelector}>
            <label>Định dạng xuất:</label>
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              className={styles.formatSelect}
            >
              <option value="json">JSON (.json)</option>
              <option value="excel">Excel (.xlsx)</option>
            </select>
          </div>

          <div className={styles.dataButtons}>
            <button
              className={styles.exportBtn}
              onClick={() => {
                if (exportFormat === "json") {
                  handleExportDataRequest();
                } else {
                  handleExportExcelRequest();
                }
              }}
            >
              Xuất Dữ Liệu ({exportFormat.toUpperCase()})
            </button>
          </div>

          {/* Import Format Selection */}
          <div className={styles.formatSelector}>
            <label>Định dạng nhập:</label>
            <select 
              value={importFormat} 
              onChange={(e) => setImportFormat(e.target.value)}
              className={styles.formatSelect}
            >
              <option value="json">JSON (.json)</option>
              <option value="excel">Excel (.xlsx)</option>
            </select>
          </div>

          {/* File Inputs */}
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            ref={fileImportRef}
            onChange={handleImportFileChange}
          />
          <input
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            ref={fileImportExcelRef}
            onChange={handleImportExcelFileChange}
          />

          <div className={styles.dataButtons}>
            <button
              className={styles.importBtn}
              onClick={() => {
                if (importFormat === "json") {
                  fileImportRef.current?.click();
                } else {
                  fileImportExcelRef.current?.click();
                }
              }}
            >
              Chọn File ({importFormat.toUpperCase()})
            </button>
          </div>

          {/* Import Status - JSON */}
          {importFormat === "json" && importedData && (
            <div className={styles.importStatus}>
              <p className={styles.importInfo}>
                Đã chọn file:{" "}
                <strong>{fileImportRef.current?.files[0]?.name}</strong>. Sẵn
                sàng để nhập.
              </p>
              <button
                className={styles.confirmImportBtn}
                onClick={handleImportDataRequest}
                disabled={isImporting}
              >
                {isImporting ? "Đang xử lý..." : "Bắt đầu Nhập Dữ Liệu"}
              </button>
            </div>
          )}

          {/* Import Status - Excel */}
          {importFormat === "excel" && importedExcelFile && (
            <div className={styles.importStatus}>
              <p className={styles.importInfo}>
                Đã chọn file:{" "}
                <strong>{fileImportExcelRef.current?.files[0]?.name}</strong>. Sẵn
                sàng để nhập.
              </p>
              <button
                className={styles.confirmImportBtn}
                onClick={handleImportExcelDataRequest}
                disabled={isImportingExcel}
              >
                {isImportingExcel ? "Đang xử lý..." : "Bắt đầu Nhập Dữ Liệu"}
              </button>
            </div>
          )}
        </div>

        {/* Logout Section */}
        <div className={styles.logoutSection}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
};

export default Settings;

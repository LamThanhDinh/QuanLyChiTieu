import React from "react";
import PasswordChange from "./PasswordChange";
import SecurityActions from "./SecurityActions";
import styles from "./SecuritySettings.module.css";

const SecuritySettings = ({
  passwords,
  message,
  isSubmitting,
  loginHistory,
  isConfirmOpen,
  setIsConfirmOpen,
  handlePasswordSubmit,
  handleChange,
  handleDeleteAccount,
}) => {
  return (
    <div className={styles.securityGrid}>
      <div className={styles.securityRow}>
        <div className={styles.securityCard}>
          <PasswordChange
            passwords={passwords}
            message={message}
            isSubmitting={isSubmitting}
            handlePasswordSubmit={handlePasswordSubmit}
            handleChange={handleChange}
          />
        </div>
        <div className={styles.securityCard}>
          <SecurityActions
            loginHistory={loginHistory}
            isConfirmOpen={isConfirmOpen}
            setIsConfirmOpen={setIsConfirmOpen}
            handleDeleteAccount={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;

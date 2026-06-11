import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCalendarDay,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./SpendingStats.module.css";
import {
  getDailySpending,
  getMonthlySpending,
} from "../../api/spendingReminderService";

const SpendingStats = () => {
  const [dailyStats, setDailyStats] = useState({
    total: 0,
    count: 0,
    transactions: [],
  });
  const [monthlyStats, setMonthlyStats] = useState({
    total: 0,
    count: 0,
    averageDaily: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpendingStats();
  }, []);

  const loadSpendingStats = async () => {
    setLoading(true);
    try {
      const [daily, monthly] = await Promise.all([
        getDailySpending(),
        getMonthlySpending(),
      ]);

      setDailyStats(daily);
      setMonthlyStats(monthly);
    } catch (error) {
      console.error("Error loading spending stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.loadingText}>Đang tải thống kê...</div>
      </div>
    );
  }

  return (
    <div className={styles.statsContainer}>
      <h4 className={styles.statsTitle}>
        <FontAwesomeIcon icon={faChartLine} /> Thống kê chi tiêu
      </h4>

      <div className={styles.statsGrid}>
        {/* Daily Stats */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FontAwesomeIcon icon={faCalendarDay} className={styles.statIcon} />
            <span className={styles.statLabel}>Hôm nay</span>
          </div>
          <div className={styles.statAmount}>
            {formatCurrency(dailyStats.total)}
          </div>
          <div className={styles.statDetail}>{dailyStats.count} giao dịch</div>
        </div>

        {/* Monthly Stats */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.statIcon} />
            <span className={styles.statLabel}>Tháng này</span>
          </div>
          <div className={styles.statAmount}>
            {formatCurrency(monthlyStats.total)}
          </div>
          <div className={styles.statDetail}>
            TB: {formatCurrency(monthlyStats.averageDaily)}/ngày
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      {dailyStats.transactions.length > 0 && (
        <div className={styles.recentTransactions}>
          <h5 className={styles.recentTitle}>Giao dịch gần đây hôm nay</h5>
          <div className={styles.transactionList}>
            {dailyStats.transactions.map((transaction, index) => (
              <div key={index} className={styles.transactionItem}>
                <span className={styles.transactionDescription}>
                  {transaction.description || "Không có mô tả"}
                </span>
                <span className={styles.transactionAmount}>
                  -{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingStats;

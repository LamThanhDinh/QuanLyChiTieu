import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faArrowTrendUp,
  faCoins,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./FinancialInsights.module.css";

const FinancialInsights = ({
  summaryStats = {},
  categoryData = {},
  period = "month",
}) => {
  // Generate insights based on data
  const generateInsights = () => {
    const insights = [];

    // Early return if no data available
    if (!summaryStats || typeof summaryStats !== "object") {
      return insights;
    }

    const totalIncome = summaryStats.income?.amount || 0;
    const totalExpense = summaryStats.expense?.amount || 0;
    const cashFlow = summaryStats.balance?.amount || 0;
    const expenseCategories = categoryData?.expense || [];

    // Cash flow analysis
    if (cashFlow > 0) {
      insights.push({
        type: "success",
        icon: faCheckCircle,
        title: "Tình hình tài chính tích cực",
        description: `Bạn đã tiết kiệm được ${Math.abs(cashFlow).toLocaleString("vi-VN")} ₫ trong ${period === "month" ? "tháng" : period === "week" ? "tuần" : "năm"} này.`,
        suggestion:
          "Hãy tiếp tục duy trì thói quen chi tiêu hợp lý và xem xét đầu tư để tăng thu nhập.",
      });
    } else if (cashFlow < 0) {
      insights.push({
        type: "warning",
        icon: faExclamationTriangle,
        title: "Chi tiêu vượt thu nhập",
        description: `Bạn đã chi tiêu nhiều hơn thu nhập ${Math.abs(cashFlow).toLocaleString("vi-VN")} ₫.`,
        suggestion:
          "Cần xem xét lại ngân sách và cắt giảm những khoản chi không cần thiết.",
      });
    } else {
      insights.push({
        type: "info",
        icon: faInfoCircle,
        title: "Thu chi cân bằng",
        description: "Thu nhập và chi tiêu của bạn đang cân bằng.",
        suggestion:
          "Hãy cố gắng tạo ra một khoản tiết kiệm nhỏ để dự phòng cho tương lai.",
      });
    }

    // Spending pattern analysis
    if (expenseCategories.length > 0) {
      const topCategory = expenseCategories[0];
      const topCategoryPercent =
        totalExpense > 0
          ? ((topCategory.value / totalExpense) * 100).toFixed(1)
          : 0;

      if (topCategoryPercent > 40) {
        insights.push({
          type: "warning",
          icon: faExclamationTriangle,
          title: "Tập trung chi tiêu cao",
          description: `${topCategory.name} chiếm ${topCategoryPercent}% tổng chi tiêu của bạn.`,
          suggestion:
            "Hãy xem xét cân bằng lại chi tiêu để giảm rủi ro tài chính.",
        });
      }

      // High spending categories
      const highSpendingCategories = expenseCategories.filter(
        (cat) => totalExpense > 0 && cat.value / totalExpense > 0.2
      );

      if (highSpendingCategories.length > 1) {
        insights.push({
          type: "info",
          icon: faInfoCircle,
          title: "Nhiều danh mục chi tiêu lớn",
          description: `Bạn có ${highSpendingCategories.length} danh mục chiếm trên 20% tổng chi tiêu.`,
          suggestion: "Xem xét ưu tiên hóa các khoản chi tiêu quan trọng nhất.",
        });
      }
    }

    // Income vs Expense ratio
    if (totalIncome > 0 && totalExpense > 0) {
      const expenseRatio = (totalExpense / totalIncome) * 100;

      if (expenseRatio > 90) {
        insights.push({
          type: "warning",
          icon: faExclamationTriangle,
          title: "Tỷ lệ chi tiêu cao",
          description: `Chi tiêu chiếm ${expenseRatio.toFixed(1)}% thu nhập của bạn.`,
          suggestion: "Nên giữ tỷ lệ chi tiêu dưới 80% để có khoản dự phòng.",
        });
      } else if (expenseRatio < 60) {
        insights.push({
          type: "success",
          icon: faCheckCircle,
          title: "Quản lý chi tiêu tốt",
          description: `Chi tiêu chỉ chiếm ${expenseRatio.toFixed(1)}% thu nhập.`,
          suggestion: "Bạn có thể xem xét đầu tư phần tiền tiết kiệm này.",
        });
      }
    }

    // Trend analysis using percentage changes from API
    const incomeChange = summaryStats.income?.percentageChange;
    const expenseChange = summaryStats.expense?.percentageChange;
    const balanceChange = summaryStats.balance?.percentageChange;

    if (incomeChange !== null && incomeChange > 20) {
      insights.push({
        type: "success",
        icon: faArrowTrendUp,
        title: "Thu nhập tăng mạnh",
        description: `Thu nhập ${summaryStats.income?.changeDescription || "tăng so với tháng trước"}.`,
        suggestion: "Đây là cơ hội tốt để tăng khoản tiết kiệm hoặc đầu tư.",
      });
    } else if (incomeChange !== null && incomeChange < -20) {
      insights.push({
        type: "warning",
        icon: faExclamationTriangle,
        title: "Thu nhập giảm",
        description: `Thu nhập ${summaryStats.income?.changeDescription || "giảm so với tháng trước"}.`,
        suggestion:
          "Hãy xem xét cách tăng thu nhập hoặc giảm chi tiêu để cân bằng.",
      });
    }

    if (expenseChange !== null && expenseChange > 20) {
      insights.push({
        type: "warning",
        icon: faArrowTrendUp,
        title: "Chi tiêu tăng mạnh",
        description: `Chi tiêu ${summaryStats.expense?.changeDescription || "tăng so với tháng trước"}.`,
        suggestion:
          "Hãy xem xét nguyên nhân tăng chi tiêu để điều chỉnh kịp thời.",
      });
    }

    if (balanceChange !== null && balanceChange > 0) {
      insights.push({
        type: "success",
        icon: faCheckCircle,
        title: "Cải thiện dòng tiền",
        description: `Dòng tiền ròng ${summaryStats.balance?.changeDescription || "được cải thiện"}.`,
        suggestion: "Hãy tiếp tục duy trì xu hướng tích cực này.",
      });
    }

    return insights.slice(0, 4); // Giới hạn 4 insights
  };

  const getInsightStyle = (type) => {
    switch (type) {
      case "success":
        return styles.successInsight;
      case "warning":
        return styles.warningInsight;
      case "info":
        return styles.infoInsight;
      default:
        return styles.defaultInsight;
    }
  };

  const getQuickStats = () => {
    // Early return with default stats if no data available
    if (!summaryStats || typeof summaryStats !== "object" || !categoryData) {
      return [
        {
          icon: faWallet,
          label: "Số danh mục chi tiêu",
          value: 0,
          color: "#ef4444",
        },
        {
          icon: faCoins,
          label: "Số nguồn thu nhập",
          value: 0,
          color: "#10b981",
        },
        {
          icon: faArrowTrendUp,
          label: "Tỷ lệ tiết kiệm",
          value: "0%",
          color: "#3b82f6",
        },
        {
          icon: faLightbulb,
          label: "Gợi ý cải thiện",
          value: 0,
          color: "#f59e0b",
        },
      ];
    }

    const totalIncome = summaryStats.income?.amount || 0;
    const totalExpense = summaryStats.expense?.amount || 0;
    const expenseCategories = categoryData?.expense || [];
    const incomeCategories = categoryData?.income || [];

    return [
      {
        icon: faWallet,
        label: "Số danh mục chi tiêu",
        value: expenseCategories.length,
        color: "#ef4444",
      },
      {
        icon: faCoins,
        label: "Số nguồn thu nhập",
        value: incomeCategories.length,
        color: "#10b981",
      },
      {
        icon: faArrowTrendUp,
        label: "Tỷ lệ tiết kiệm",
        value:
          totalIncome > 0
            ? `${(((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)}%`
            : "0%",
        color: "#3b82f6",
      },
      {
        icon: faLightbulb,
        label: "Gợi ý cải thiện",
        value: insights.filter((i) => i.type === "warning").length,
        color: "#f59e0b",
      },
    ];
  };

  // Show loading state if no data yet
  if (!summaryStats) {
    return (
      <div className={styles.emptyState}>
        <FontAwesomeIcon icon={faLightbulb} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Đang tải dữ liệu...</h3>
        <p className={styles.emptyDescription}>
          Vui lòng chờ trong giây lát để hệ thống phân tích dữ liệu tài chính
          của bạn.
        </p>
      </div>
    );
  }

  const insights = generateInsights();

  // Show empty state only if we have data but no insights
  if (summaryStats && insights.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FontAwesomeIcon icon={faLightbulb} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Chưa đủ dữ liệu để phân tích</h3>
        <p className={styles.emptyDescription}>
          Hãy thêm nhiều giao dịch hơn để nhận được những insights hữu ích về
          tài chính của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <h3 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faLightbulb} className={styles.titleIcon} />
          Thống kê nhanh
        </h3>
        <div className={styles.statsGrid}>
          {getQuickStats().map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statIcon} style={{ color: stat.color }}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className={styles.insights}>
        <h3 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faLightbulb} className={styles.titleIcon} />
          Phân tích thông minh
        </h3>
        <div className={styles.insightsList}>
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`${styles.insightCard} ${getInsightStyle(insight.type)}`}
            >
              <div className={styles.insightHeader}>
                <div className={styles.insightIcon}>
                  <FontAwesomeIcon icon={insight.icon} />
                </div>
                <h4 className={styles.insightTitle}>{insight.title}</h4>
              </div>
              <p className={styles.insightDescription}>{insight.description}</p>
              <p className={styles.insightSuggestion}>{insight.suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;

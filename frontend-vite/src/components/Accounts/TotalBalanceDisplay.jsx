// src/components/Accounts/TotalBalanceDisplay.jsx
import React from "react";
import styles from "./TotalBalanceDisplay.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// ... các hàm formatCurrency, isColorLight, renderCustomizedLabel không đổi ...
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const formatCurrency = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0 ₫";
  }
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const isColorLight = (hexColor) => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  fill,
}) => {
  if (percent * 100 < 1) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textColor = isColorLight(fill) ? "#333333" : "#FFFFFF";
  return (
    <text
      x={x}
      y={y}
      fill={textColor}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={8}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const TotalBalanceDisplay = ({
  accounts,
  isLoading,
  highlightedAccountId,
  onHoverAccount,
}) => {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
      </div>
    );
  }

  // ===== BẮT ĐẦU THAY ĐỔI LOGIC =====

  // 1. Vẫn tính tổng số dư ròng để hiển thị
  const totalNetBalance = accounts.reduce(
    (sum, acc) => sum + (acc.balance || 0),
    0
  );

  // 2. Lọc ra các tài khoản có số dư dương (tài sản)
  const positiveAccounts = accounts.filter((acc) => acc.balance > 0);

  // 3. Tính tổng của các tài khoản dương này. Đây sẽ là "100%" của biểu đồ.
  const totalPositiveBalance = positiveAccounts.reduce(
    (sum, acc) => sum + acc.balance,
    0
  );

  // 4. Tạo dữ liệu cho biểu đồ DỰA TRÊN TỔNG TÀI SẢN
  const chartData = positiveAccounts.map((acc) => ({
    ...acc,
    percent: totalPositiveBalance > 0 ? acc.balance / totalPositiveBalance : 0,
  }));

  // ===== KẾT THÚC THAY ĐỔI LOGIC =====

  return (
    <div className={styles.totalBalanceContainer}>
      <h3 className={styles.title}>Tổng Quan Nguồn Tiền</h3>

      {/* Hiển thị tổng số dư ròng */}
      <div
        className={`${styles.totalAmount} ${
          totalNetBalance < 0 ? styles.negativeTotal : ""
        }`}
      >
        {totalNetBalance < 0 && (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            style={{ color: "#e74c3c", marginRight: 6 }}
          />
        )}
        {formatCurrency(totalNetBalance)}
      </div>
      <p className={styles.totalLabel}>Tổng số dư</p>

      <div className={styles.chartSection}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="balance"
              nameKey="name"
              labelLine={false}
              label={renderCustomizedLabel}
              isAnimationActive={true}
              onMouseLeave={() => onHoverAccount && onHoverAccount(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={highlightedAccountId === entry.id ? "#222" : "#fff"}
                  strokeWidth={highlightedAccountId === entry.id ? 4 : 2}
                  onMouseEnter={() =>
                    onHoverAccount && onHoverAccount(entry.id)
                  }
                  style={{
                    cursor: "pointer",
                    filter:
                      highlightedAccountId === entry.id
                        ? "drop-shadow(0 0 8px #8884d8)"
                        : "none",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${value.toLocaleString("vi-VN")} ₫`,
                props.payload.name,
              ]}
              contentStyle={{
                borderRadius: 12,
                boxShadow: "0 2px 12px #0001",
                fontWeight: 600,
                fontSize: 14,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.legendSection}>
        <ul className={styles.legendList}>
          {chartData.map((entry, index) => (
            <li
              key={`item-${index}`}
              className={styles.legendItem}
              style={{
                backgroundColor: "#fff",
                borderRadius: 8,
                transition: "background 0.2s",
              }}
            >
              <span
                className={styles.legendIcon}
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className={styles.legendInfo}>
                <span className={styles.legendText}>{entry.name}</span>
                <span className={styles.legendPercent}>
                  {`(${(entry.percent * 100).toFixed(1)}%)`}
                </span>
              </div>
              <span className={styles.legendValue}>
                {formatCurrency(entry.balance)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TotalBalanceDisplay;

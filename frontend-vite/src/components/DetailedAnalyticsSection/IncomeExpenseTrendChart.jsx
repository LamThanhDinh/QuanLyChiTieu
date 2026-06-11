// src/components/DetailedAnalyticsSection/IncomeExpenseTrendChart.jsx
import React, { useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  ReferenceLine,
} from "recharts";
import styles from "./IncomeExpenseTrendChart.module.css";

const formatCurrency = (value) => {
  if (value === 0) return "0 ₫";
  if (!value) return "";
  return `${(value / 1000000).toLocaleString("vi-VN")}tr ₫`;
};

const CustomTooltip = ({ active, payload, label, categoryName, period, rawData }) => {
  if (active && payload && payload.length) {
    // Tìm dữ liệu gốc để lấy thông tin ngày tháng đầy đủ
    const originalData = rawData?.find(item => {
      const dateParts = item.name.split("-");
      if (period === "year") {
        return `T${parseInt(dateParts[1], 10)}` === label;
      } else {
        return dateParts[2] === label;
      }
    });

    // Format tiêu đề tooltip
    let displayTitle = label;
    if (originalData) {
      const dateParts = originalData.name.split("-");
      if (period === "year") {
        displayTitle = `Tháng ${parseInt(dateParts[1], 10)}/${dateParts[0]}`;
      } else {
        displayTitle = `Ngày ${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      }
    }

    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{displayTitle}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className={styles.tooltipEntry}>
            {`${entry.name}: ${entry.value?.toLocaleString("vi-VN")} ₫`}
          </p>
        ))}
        {categoryName && (
          <p className={styles.tooltipCategory}>
            Chi tiêu theo danh mục: {categoryName}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Component giờ chỉ là một "dumb component", nhận dữ liệu và hiển thị
const IncomeExpenseTrendChart = ({
  data,
  period,
  loading,
  error,
  categoryName,
  categoryId,
}) => {
  // useCallback để không phải tính toán lại mỗi lần render, trừ khi data hoặc period thay đổi
  const formatDataForChart = useCallback((rawData, period) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }
    return rawData.map((item) => {
      const dateParts = item.name.split("-");
      let displayName;
      // Dựa trên period được truyền từ component cha để định dạng trục X
      if (period === "year") {
        displayName = `T${parseInt(dateParts[1], 10)}`;
      } else {
        displayName = dateParts[2];
      }
      return {
        name: displayName,
        income: item.income || 0,
        expense: item.expense || 0,
      };
    });
  }, []);

  const chartData = formatDataForChart(data, period);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartContainer}>
        {loading && <p className={styles.loadingText}>Đang tải biểu đồ...</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {!loading && !error && chartData.length === 0 && (
          <p className={styles.noDataText}>
            Không có dữ liệu cho khoảng thời gian này.
          </p>
        )}
        {!loading && !error && chartData.length > 0 && (
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <ReferenceLine 
                  y={0} 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: "0₫", position: "left", fontSize: 12, fill: "#3B82F6", offset: 12 }}
                />
                <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }}>
                  <Label
                    value={period === "year" ? "Tháng" : "Ngày"}
                    offset={-5}
                    position="insideBottom"
                  />
                </XAxis>
                <YAxis
                  stroke="#666"
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                  width={60}
                  domain={['dataMin - 1000000', 'dataMax + 1000000']}
                  tickMargin={21}
                >
                  <Label
                    value="Số tiền (triệu ₫)"
                    angle={-90}
                    position="insideLeft"
                    style={{ textAnchor: "middle" }}
                    offset={-5}
                  />
                </YAxis>
                <Tooltip
                  content={<CustomTooltip categoryName={categoryName} period={period} rawData={data} />}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontWeight: 600 }}>
                      {value}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Thu nhập (tổng)"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#10B981" }}
                  activeDot={{ r: 6, fill: "#10B981" }}
                  strokeDasharray={categoryId ? "5 5" : "0"}
                  opacity={categoryId ? 0.7 : 1}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name={categoryName ? `Chi tiêu - ${categoryName}` : "Chi tiêu (tổng)"}
                  stroke="#EF4444"
                  strokeWidth={categoryId ? 3 : 2}
                  dot={{ r: categoryId ? 5 : 4, fill: "#EF4444" }}
                  activeDot={{ r: 7, fill: "#EF4444" }}
                  strokeDasharray="0"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeExpenseTrendChart;

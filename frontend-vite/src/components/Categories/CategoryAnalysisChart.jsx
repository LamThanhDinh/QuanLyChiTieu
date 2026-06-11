// frontend-vite/src/components/Categories/CategoryAnalysisChart.jsx
import React, { useState } from "react";
import { Sector } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BasePieChart from "../Common/BasePieChart";
import DateRangeNavigator from "../Common/DateRangeNavigator";
import { getIconObject } from "../../utils/iconMap";
import customChartStyles from "./CategoryAnalysisChart.module.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
  "#3366CC",
  "#DC3912",
  "#FF9900",
  "#109618",
  "#990099",
  "#0099C6",
];

const CategoryAnalysisChart = ({
  data,
  total,
  loading,
  error,
  categoryType,
  onActiveCategoryChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Loại bỏ logic điều hướng vì đã có ở CategoryPageHeader

  const chartTitle =
    categoryType === "THUNHAP"
      ? "Cơ cấu Thu nhập"
      : categoryType === "CHITIEU"
        ? "Cơ cấu Chi tiêu"
        : "Cơ cấu Thu chi";

  // Custom active shape renderer - subtle highlight
  const renderCustomActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;

    return (
      <g>
        {/* Subtle glow effect */}
        <defs>
          <filter id={`glow-${fill.replace("#", "")}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main slice with subtle expansion */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: `url(#glow-${fill.replace("#", "")})`,
            opacity: 0.95,
          }}
        />

        {/* Subtle border */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill="none"
          stroke="#fff"
          strokeWidth={2}
        />
      </g>
    );
  };

  const handlePieClick = (sliceData, index) => {
    const newIndex = activeIndex === index ? null : index;
    setActiveIndex(newIndex);
    if (onActiveCategoryChange) {
      // Truyền đúng format {id, color, name} cho parent
      const categoryData =
        newIndex !== null
          ? {
              id: sliceData._id || sliceData.id,
              color: sliceData.color,
              name: sliceData.name,
            }
          : null;
      onActiveCategoryChange(categoryData);
    }
  };

  return (
    <div className={customChartStyles.chartWrapper}>
      <div className={customChartStyles.chartTitle}>
        <h3>{chartTitle}</h3>
      </div>

      <BasePieChart
        data={data}
        total={total}
        loading={loading}
        error={error}
        onSliceClick={handlePieClick}
        activeCategoryId={
          activeIndex !== null && data[activeIndex]
            ? data[activeIndex]._id || data[activeIndex].id
            : null
        }
        activeCategoryName={
          activeIndex !== null && data[activeIndex]
            ? data[activeIndex].name
            : null
        }
        colors={COLORS}
        showCenterLabel={true}
        showLabels={true}
        showTooltip={true}
        showActiveShape={true}
        renderCustomActiveShape={renderCustomActiveShape}
        detailsLink={{
          url: "/transactions",
          text: "Xem giao dịch",
          title: "Xem trang quản lý giao dịch",
        }}
        chartConfig={{
          innerRadius: 66,
          outerRadius: 121,
          paddingAngle: 2,
          height: 418,
        }}
        labelConfig={{
          fontSize: 12,
          activeFontSize: 15,
          fontWeight: 600,
          activeFontWeight: 700,
          strokeWidth: 1.5,
          activeStrokeWidth: 3,
          labelRadius: 55,
          activeLabelRadius: 70,
        }}
      />
    </div>
  );
};

export default CategoryAnalysisChart;

// --- renderCustomizedLabel Component (Không thay đổi) ---
const _renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  payload,
}) => {
  const RADIAN = Math.PI / 180;
  const labelRadius = outerRadius + 60;
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
  const icon = getIconObject(payload.icon);

  if (percent < 0.01) {
    return null;
  }

  const iconSize = 20;
  const textOffset = 5;
  const isLeft = x < cx;

  return (
    <g textAnchor={isLeft ? "end" : "start"}>
      <path
        d={`M${cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)},${
          cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)
        } L${x},${y}`}
        stroke="#999"
        fill="none"
        strokeWidth={1}
      />
      <foreignObject
        x={isLeft ? x - iconSize : x}
        y={y - iconSize / 2}
        width={iconSize}
        height={iconSize}
      >
        <FontAwesomeIcon
          icon={icon}
          style={{ width: "100%", height: "100%", color: "#333" }}
        />
      </foreignObject>
      <text
        x={isLeft ? x - iconSize - textOffset : x + iconSize + textOffset}
        y={y}
        dominantBaseline="central"
        fill="#333"
        fontSize="13"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

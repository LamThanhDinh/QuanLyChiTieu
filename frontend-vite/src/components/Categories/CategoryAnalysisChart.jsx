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
  detailsLink,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Loáº¡i bá» logic Ä‘iá»u hÆ°á»›ng vĂ¬ Ä‘Ă£ cĂ³ á»Ÿ CategoryPageHeader

  const chartTitle =
    categoryType === "THUNHAP"
      ? "CÆ¡ cáº¥u Thu nháº­p"
      : categoryType === "CHITIEU"
        ? "CÆ¡ cáº¥u Chi tiĂªu"
        : "CÆ¡ cáº¥u Thu chi";

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
      // Truyá»n Ä‘Ăºng format {id, color, name} cho parent
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
        detailsLink={
          detailsLink === undefined
            ? {
                url: "/transactions",
                text: "Xem giao dịch",
                title: "Xem trang quản lý giao dịch",
              }
            : detailsLink
        }
        chartConfig={{
          innerRadius: 54,
          outerRadius: 80,
          paddingAngle: 2,
          height: 340,
          chartMargin: { top: 20, right: 110, bottom: 48, left: 110 },
        }}
        labelConfig={{
          fontSize: 12,
          activeFontSize: 13,
          fontWeight: 700,
          activeFontWeight: 800,
          strokeWidth: 1.2,
          activeStrokeWidth: 2,
          labelRadius: 32,
          activeLabelRadius: 40,
          labelMaxLength: 16,
        }}
      />
    </div>
  );
};

export default CategoryAnalysisChart;

// --- renderCustomizedLabel Component (KhĂ´ng thay Ä‘á»•i) ---
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
        d={`M${cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)},${cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)
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

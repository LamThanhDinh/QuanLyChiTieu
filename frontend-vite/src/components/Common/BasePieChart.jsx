// src/components/Common/BasePieChart.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./BasePieChart.module.css";
import { getIconObject } from "../../utils/iconMap";

// Default colors that can be overridden
const DEFAULT_COLORS = [
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

const formatCurrency = (value) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

// Smart text truncation function
const truncateText = (text, maxLength = 30) => {
  if (!text) return "";

  // If text is already short enough, return as is
  if (text.length <= maxLength) return text;

  // Try to break at word boundaries
  const words = text.split(" ");
  let result = "";

  for (let i = 0; i < words.length; i++) {
    const wordToAdd = i === 0 ? words[i] : " " + words[i];

    if ((result + wordToAdd).length <= maxLength) {
      result += wordToAdd;
    } else {
      // If we can't fit this word, add ellipsis if we have something
      if (result.length > 0) {
        return result + "...";
      } else {
        // If even the first word is too long, truncate it
        return words[0].substring(0, maxLength - 3) + "...";
      }
    }
  }

  // If we've processed all words and they fit, return the result
  return result;
};

/**
 * Base Pie Chart Component - Highly Customizable and Reusable
 *
 * @param {Object} props
 * @param {string} props.title - Chart title (optional)
 * @param {Array} props.data - Array of data objects with {id, name, value, icon?, color?}
 * @param {number} props.total - Total value for percentage calculations
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.onSliceClick - Callback when slice is clicked (data, index) => void
 * @param {string|number} props.activeCategoryId - ID of active/selected category
 * @param {string} props.activeCategoryName - Name of active category
 * @param {Array} props.colors - Custom color palette (optional)
 * @param {Object} props.chartConfig - Chart configuration
 * @param {number} props.chartConfig.innerRadius - Inner radius (default: 80)
 * @param {number} props.chartConfig.outerRadius - Outer radius (default: 120)
 * @param {number} props.chartConfig.paddingAngle - Padding between slices (default: 2)
 * @param {number} props.chartConfig.height - Chart height (default: 400)
 * @param {boolean} props.showCenterLabel - Show center label when no slice selected (default: true)
 * @param {boolean} props.showLabels - Show slice labels (default: true)
 * @param {boolean} props.showTooltip - Show tooltip on hover (default: true)
 * @param {boolean} props.showActiveShape - Show active shape highlight (default: true)
 * @param {Function} props.renderCustomLabel - Custom label renderer (optional)
 * @param {Function} props.renderCustomTooltip - Custom tooltip renderer (optional)
 * @param {Object} props.detailsLink - Details link configuration
 * @param {string} props.detailsLink.url - Link URL
 * @param {string} props.detailsLink.text - Link text (default: "Xem chi tiết")
 * @param {string} props.detailsLink.title - Link title attribute
 * @param {Object} props.labelConfig - Label styling configuration
 * @param {number} props.labelConfig.fontSize - Label font size
 * @param {number} props.labelConfig.activeFontSize - Active label font size
 * @param {number} props.labelConfig.fontWeight - Label font weight
 * @param {number} props.labelConfig.activeFontWeight - Active label font weight
 */
const BasePieChart = ({
  title,
  data = [],
  total = 0,
  loading = false,
  error = null,
  onSliceClick,
  activeCategoryId = null,
  activeCategoryName = null,
  colors = DEFAULT_COLORS,
  chartConfig = {},
  showCenterLabel = true,
  showLabels = true,
  showTooltip = true,
  showActiveShape = true,
  renderCustomLabel,
  renderCustomTooltip,
  renderCustomActiveShape,
  detailsLink,
  labelConfig = {},
}) => {
  // Chart configuration with defaults
  const {
    innerRadius = 95,
    outerRadius = 145,
    paddingAngle = 2,
    height = 480,
  } = chartConfig;

  // Label configuration with defaults
  const {
    fontSize = 13,
    activeFontSize = 15,
    fontWeight = 600,
    activeFontWeight = 700,
    strokeWidth = 1.5,
    activeStrokeWidth = 2.2,
    labelRadius = 35,
    activeLabelRadius = 45,
  } = labelConfig;

  // Process data to ensure colors are assigned
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item, index) => ({
      ...item,
      id: item.id || item._id || `category-${index}`, // Ensure every item has an ID
      color: item.color || colors[index % colors.length],
    }));
  }, [data, colors]);

  // Calculate active index from prop
  const activeIndex = useMemo(
    () =>
      activeCategoryId
        ? processedData.findIndex((d) => (d.id || d._id) === activeCategoryId)
        : -1,
    [processedData, activeCategoryId]
  );

  // Default label renderer with dynamic styling
  const defaultRenderLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    payload,
    index,
  }) => {
    const isActive = index === activeIndex;

    // Don't show label for very small slices unless it's active
    if (!isActive && percent < 0.02) return null;

    // Style based on active state
    const currentLabelRadius = isActive
      ? outerRadius + activeLabelRadius
      : outerRadius + labelRadius;
    const currentStrokeWidth = isActive ? activeStrokeWidth : strokeWidth;
    const currentFontSize = isActive ? activeFontSize : fontSize;
    const currentFontWeight = isActive ? activeFontWeight : fontWeight;

    const RADIAN = Math.PI / 180;
    const x = cx + currentLabelRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + currentLabelRadius * Math.sin(-midAngle * RADIAN);

    const iconSize = 20;
    const textOffset = 5;
    const isLeft = x < cx;

    return (
      <g textAnchor={isLeft ? "end" : "start"} fill={payload.fill}>
        {/* Connection line */}
        <path
          d={`M${cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)},${
            cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)
          } L${x},${y}`}
          stroke={payload.fill}
          fill="none"
          strokeWidth={currentStrokeWidth}
        />

        {/* Icon */}
        {payload.icon && (
          <foreignObject
            x={isLeft ? x - iconSize : x}
            y={y - iconSize / 2}
            width={iconSize}
            height={iconSize}
          >
            <FontAwesomeIcon
              icon={getIconObject(payload.icon)}
              style={{ width: "100%", height: "100%", color: payload.fill }}
            />
          </foreignObject>
        )}

        {/* Percentage text */}
        <text
          x={isLeft ? x - iconSize - textOffset : x + iconSize + textOffset}
          y={y}
          dominantBaseline="central"
          fontSize={currentFontSize}
          fontWeight={currentFontWeight}
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  // Default active shape renderer
  const defaultRenderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
      props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: `drop-shadow(0px 4px 8px ${fill}60)`,
          }}
        />
      </g>
    );
  };

  // Default tooltip renderer
  const defaultRenderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {d.icon && <FontAwesomeIcon icon={getIconObject(d.icon)} />}
            <span style={{ fontWeight: 600 }}>{d.name}</span>
          </div>
          <div>
            Số tiền: <b>{formatCurrency(d.value)}</b>
          </div>
          <div>
            Tỉ lệ: <b>{((d.value / total) * 100).toFixed(1)}%</b>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle slice click
  const handlePieClick = (pieData, index) => {
    if (onSliceClick) {
      onSliceClick(processedData[index], index);
    }
  };

  // Handle center label click to reset to total view
  const handleCenterLabelClick = () => {
    if (onSliceClick && activeIndex !== -1) {
      onSliceClick(null, -1); // Reset to show total
    }
  };

  // Handle center click to deselect
  const handleCenterClick = (e) => {
    // Only handle click if it's on the center label itself, not on the chart
    if (
      e.target.closest(`.${styles.centerLabel}`) ||
      e.target.closest(`.${styles.centerLabelActive}`)
    ) {
      if (activeIndex !== -1) {
        // Deselect current slice
        if (onSliceClick) {
          onSliceClick(null, -1);
        }
      }
    }
  };

  // Loading state
  if (loading) {
    return <p className={styles.loadingText}>Đang tải...</p>;
  }

  // Error state
  if (error) {
    return <p className={styles.errorText}>{error}</p>;
  }

  // No data state
  if (!processedData || processedData.length === 0) {
    return (
      <p className={styles.noDataText}>
        Không có dữ liệu cho khoảng thời gian này.
      </p>
    );
  }

  // Choose label renderer
  const labelRenderer = renderCustomLabel || defaultRenderLabel;

  // Choose tooltip renderer
  const tooltipRenderer = renderCustomTooltip || defaultRenderTooltip;

  return (
    <div className={styles.chartCard}>
      {/* Chart Title */}
      {title && (
        <div className={styles.chartTitle}>
          <h3>{title}</h3>
        </div>
      )}

      <div className={styles.chartContainer}>
        <div style={{ position: "relative", width: "100%", height }}>
          {/* Center label when no slice is selected */}
          {showCenterLabel && activeIndex === -1 && (
            <div className={styles.centerLabel}>
              <span>Tổng cộng</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          )}

          {/* Center label when a slice is selected */}
          {showCenterLabel &&
            activeIndex !== -1 &&
            processedData[activeIndex] && (
              <div
                className={styles.centerLabelActive}
                onClick={handleCenterLabelClick}
                title="Click để xem tổng quan"
              >
                <span className={styles.categoryName}>
                  {truncateText(processedData[activeIndex].name, 35)}
                </span>
                <span className={styles.categoryAmount}>
                  {formatCurrency(processedData[activeIndex].value)}
                </span>
              </div>
            )}

          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={paddingAngle}
                dataKey="value"
                nameKey="name"
                onClick={handlePieClick}
                isAnimationActive={true}
                activeIndex={activeIndex}
                activeShape={
                  showActiveShape
                    ? renderCustomActiveShape || defaultRenderActiveShape
                    : null
                }
                label={
                  showLabels
                    ? (props) => {
                        const isActive = props.index === activeIndex;

                        // If there's an active slice and this isn't it, don't show label
                        if (activeIndex !== -1 && !isActive) {
                          return null;
                        }

                        return labelRenderer({ ...props, isActive });
                      }
                    : false
                }
                labelLine={false}
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{ cursor: onSliceClick ? "pointer" : "default" }}
                  />
                ))}
              </Pie>

              {showTooltip && <Tooltip content={tooltipRenderer} />}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Details Link - positioned at bottom right corner */}
        {detailsLink && (
          <div className={styles.detailsLink}>
            <Link
              to={detailsLink.url}
              title={detailsLink.title}
              className={styles.detailsLinkButton}
            >
              {detailsLink.text || "Xem chi tiết"}
              <span className={styles.detailsLinkArrow}>→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasePieChart;

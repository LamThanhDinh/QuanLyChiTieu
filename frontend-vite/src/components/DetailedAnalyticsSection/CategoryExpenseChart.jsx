// frontend-vite/src/components/DetailedAnalyticsSection/CategoryExpenseChart.jsx
import React from "react";
import BasePieChart from "../Common/BasePieChart";

const CategoryExpenseChart = ({
  data,
  total,
  loading,
  error,
  onSliceClick,
  activeCategoryId,
  activeCategoryName,
}) => {
  return (
    <BasePieChart
      data={data}
      total={total}
      loading={loading}
      error={error}
      onSliceClick={onSliceClick}
      activeCategoryId={activeCategoryId}
      activeCategoryName={activeCategoryName}
      showCenterLabel={true}
      showLabels={true}
      showTooltip={true}
      showActiveShape={true}
      detailsLink={{
        url: activeCategoryId
          ? `/transactions?categoryId=${activeCategoryId}&focus=filter&source=analytics`
          : "/categories?focus=list",
        text: "Xem chi tiết",
        title: activeCategoryId
          ? `Xem các giao dịch của mục "${activeCategoryName}"`
          : "Xem trang quản lý danh mục"
      }}
      chartConfig={{
        innerRadius: 80,
        outerRadius: 120,
        paddingAngle: 2,
        height: 400,
      }}
      colors={[
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#AF19FF",
        "#FF4560",
        "#3366CC",
        "#DC3912",
      ]}
    />
  );
};

export default CategoryExpenseChart;

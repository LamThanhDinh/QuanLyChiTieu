// frontend-vite/src/components/Categories/CategoryAnalysisChart_new.jsx
import React from "react";
import BasePieChart from "../Common/BasePieChart";

const CategoryAnalysisChart = ({
  data,
  total,
  loading,
  error,
  categoryType,
  onActiveCategoryChange,
  activeCategory
}) => {
  const chartTitle =
    categoryType === "THUNHAP"
      ? "Cơ cấu Thu nhập"
      : categoryType === "CHITIEU"
      ? "Cơ cấu Chi tiêu"
      : "Cơ cấu Thu chi";

  const handlePieClick = (sliceData, index) => {
    if (onActiveCategoryChange) {
      // Nếu đang active slice này, thì bỏ chọn. Ngược lại, chọn slice này
      const isCurrentlyActive = activeCategory && activeCategory.id === (sliceData._id || sliceData.id);
      const categoryData = isCurrentlyActive ? null : {
        id: sliceData._id || sliceData.id,
        color: sliceData.color,
        name: sliceData.name
      };
      onActiveCategoryChange(categoryData);
    }
  };

  return (
    <BasePieChart
      title={chartTitle}
      data={data}
      total={total}
      loading={loading}
      error={error}
      onSliceClick={handlePieClick}
      activeCategoryId={activeCategory ? activeCategory.id : null}
      activeCategoryName={activeCategory ? activeCategory.name : null}
      showCenterLabel={true}
      showLabels={true}
      showTooltip={true}
      showActiveShape={true}
      detailsLink={{
        url: "/transactions",
        text: "Xem giao dịch",
        title: "Xem trang quản lý giao dịch"
      }}
      chartConfig={{
        innerRadius: 50,
        outerRadius: 100,
        paddingAngle: 2,
        height: 320,
      }}
      labelConfig={{
        fontSize: 11,
        activeFontSize: 13,
        fontWeight: 600,
        activeFontWeight: 700,
        labelRadius: 35,
        activeLabelRadius: 40,
      }}
    />
  );
};

export default CategoryAnalysisChart;

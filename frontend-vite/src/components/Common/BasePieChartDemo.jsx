// Demo example for BasePieChart usage
import React from 'react';
import BasePieChart from '../Common/BasePieChart';
import { sampleDataWithLongNames, sampleDataShortNames } from './BasePieChartTestData';

const BasePieChartDemo = () => {
  const handleSliceClick = (data, index) => {
    console.log('Slice clicked:', data, index);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div>
        <h2>BasePieChart với tên danh mục dài</h2>
        
        <BasePieChart
          title="Test với tên danh mục dài"
          data={sampleDataWithLongNames}
          total={sampleDataWithLongNames.reduce((sum, item) => sum + item.value, 0)}
          loading={false}
          error={null}
          onSliceClick={handleSliceClick}
          activeCategoryId={null}
          activeCategoryName={null}
          showCenterLabel={true}
          showLabels={true}
          showTooltip={true}
          showActiveShape={true}
          detailsLink={{
            url: "/transactions",
            text: "Xem chi tiết",
            title: "Xem trang quản lý giao dịch"
          }}
          chartConfig={{
            innerRadius: 80,
            outerRadius: 120,
            paddingAngle: 2,
            height: 400,
          }}
        />
      </div>

      <div>
        <h2>BasePieChart với tên danh mục ngắn</h2>
        
        <BasePieChart
          title="Test với tên danh mục ngắn"
          data={sampleDataShortNames}
          total={sampleDataShortNames.reduce((sum, item) => sum + item.value, 0)}
          loading={false}
          error={null}
          onSliceClick={handleSliceClick}
          activeCategoryId={null}
          activeCategoryName={null}
          showCenterLabel={true}
          showLabels={true}
          showTooltip={true}
          showActiveShape={true}
          detailsLink={{
            url: "/transactions",
            text: "Xem chi tiết",
            title: "Xem trang quản lý giao dịch"
          }}
          chartConfig={{
            innerRadius: 80,
            outerRadius: 120,
            paddingAngle: 2,
            height: 400,
          }}
        />
      </div>
    </div>
  );
};

export default BasePieChartDemo;

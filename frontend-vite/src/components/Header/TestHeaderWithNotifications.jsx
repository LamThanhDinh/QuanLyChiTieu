import React from "react";
import Header from "./Header";

// Component test để kiểm tra tính năng notification
const TestHeaderWithNotifications = () => {
  // Thiết lập một số mock data trong localStorage để test
  React.useEffect(() => {
    const mockUser = {
      fullname: "Nguyễn Văn A",
      avatar: "",
    };
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("token", "mock-token");
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header />
      <div style={{ padding: "20px" }}>
        <h2>Test Notification Feature</h2>
        <p>
          Tính năng thông báo đã được tích hợp vào Header component. Icon chuông
          sẽ hiển thị số lượng thông báo và cho phép click để xem danh sách.
        </p>
        <ul>
          <li>🔴 Thông báo ưu tiên cao: Mục tiêu quá hạn</li>
          <li>
            🟡 Thông báo ưu tiên trung bình: Mục tiêu sắp hết hạn (trong 4-7
            ngày)
          </li>
          <li>🟢 Thông báo ưu tiên thấp: Mục tiêu gần hoàn thành (≥90%)</li>
        </ul>
      </div>
    </div>
  );
};

export default TestHeaderWithNotifications;

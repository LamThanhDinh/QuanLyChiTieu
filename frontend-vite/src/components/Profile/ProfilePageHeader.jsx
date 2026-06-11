import React from "react";
import HeaderCard from "../Common/HeaderCard";

const ProfilePageHeader = ({ activeTab, setActiveTab }) => {
  const tabButton = (tab, label) => (
    <button
      key={tab}
      style={{
        background: activeTab === tab ? "#fff" : "#f4f6fa",
        color: activeTab === tab ? "#1a4fa3" : "#333",
        border: activeTab === tab ? "2px solid #1a4fa3" : "none",
        borderRadius: 8,
        padding: "8px 24px",
        fontWeight: activeTab === tab ? 700 : 500,
        fontSize: "1rem",
        marginRight: 8,
        cursor: "pointer",
        outline: "none",
        boxShadow: activeTab === tab ? "0 2px 8px rgba(26,79,163,0.07)" : "none",
        transition: "all 0.2s"
      }}
      onClick={() => setActiveTab(tab)}
    >
      {label}
    </button>
  );

  return (
    <HeaderCard
      title="Hồ sơ & Cài đặt"
      action={[
        tabButton("info", "Thông tin"),
        tabButton("security", "Bảo mật")
      ]}
    />
  );
};

export default ProfilePageHeader; 
// Test script để test modal với no data
import React, { useState } from "react";
import AddEditTransactionModal from "../src/components/Transactions/AddEditTransactionModal";

const TestModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Modal - No Data Scenario</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Mở Modal (No Data)
      </button>

      <AddEditTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={() => {
          console.log("Transaction submitted successfully");
          setIsModalOpen(false);
        }}
        mode="add"
      />
    </div>
  );
};

export default TestModal;

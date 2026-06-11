// Example usage trong TransactionPage.jsx
import React, { useState } from "react";
import { useUserDataStatus } from "../hooks/useUserDataStatus";
import SetupPrompt from "../components/Common/SetupPrompt";
import AddEditTransactionModal from "../components/Transactions/AddEditTransactionModal";

const TransactionPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSetupPrompt, setShowSetupPrompt] = useState(true);
  const { hasMinimumData, isLoading, refetch } = useUserDataStatus();

  const handleDataCreated = () => {
    refetch(); // Refresh data status
    setShowSetupPrompt(false); // Hide prompt
  };

  const handleAddTransaction = () => {
    if (!hasMinimumData) {
      setShowSetupPrompt(true); // Show setup prompt
      return;
    }
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="transaction-page">
      {/* Setup prompt for new users */}
      {!hasMinimumData && showSetupPrompt && (
        <SetupPrompt
          onDataCreated={handleDataCreated}
          onDismiss={() => setShowSetupPrompt(false)}
        />
      )}

      {/* Main content */}
      <div className="page-header">
        <h1>Giao dịch</h1>
        <button onClick={handleAddTransaction} className="btn btn-primary">
          Thêm giao dịch
        </button>
      </div>

      {/* Transaction list - only show if has data */}
      {hasMinimumData ? (
        <div>
          {/* Your transaction list component here */}
          <p>Danh sách giao dịch sẽ hiển thị ở đây...</p>
        </div>
      ) : (
        <div className="empty-state">
          <p>Hãy tạo dữ liệu mặc định để bắt đầu quản lý chi tiêu!</p>
        </div>
      )}

      {/* Transaction Modal */}
      <AddEditTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
          // Refresh transaction list here
        }}
        mode="add"
      />
    </div>
  );
};

export default TransactionPage;

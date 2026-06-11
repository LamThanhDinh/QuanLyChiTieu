import { useState, useEffect } from "react";
import { checkUserDataStatus } from "../api/setupService";

/**
 * Custom hook để kiểm tra trạng thái dữ liệu của user
 */
export const useUserDataStatus = () => {
  const [status, setStatus] = useState({
    hasCategories: false,
    hasAccounts: false,
    hasMinimumData: false,
    isLoading: true,
    error: null,
  });

  const checkStatus = async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true, error: null }));
      const result = await checkUserDataStatus();
      setStatus({
        ...result,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Không thể kiểm tra trạng thái dữ liệu",
      }));
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    ...status,
    refetch: checkStatus,
  };
};

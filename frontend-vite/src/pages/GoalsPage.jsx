// src/pages/GoalsPage.jsx (Phiên bản đã sửa lỗi và cải tiến)

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// ✅ SỬA LỖI: Import đúng các hàm từ service
import {
  getGoals,
  deleteGoal,
  toggleArchiveGoal,
  togglePinGoal,
} from "../api/goalService";
import GoalsList from "../components/Goals/GoalsList";
import AddEditGoalModal from "../components/Goals/AddEditGoalModal";
import { getProfile } from "../api/profileService";
import HeaderCard from "../components/Common/HeaderCard";
import styles from "../styles/GoalsPage.module.css";
import headerStyles from "../components/Common/HeaderCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBullseye } from "@fortawesome/free-solid-svg-icons";
import Header from "../components/Header/Header";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import AddFundsModal from "../components/Goals/AddFundsModal";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import Button from "../components/Common/Button";
import { getGreeting, getFullDate } from "../utils/timeHelpers";
import PageContentContainer from "../components/Common/PageContentContainer";
import GoalControls from "../components/Goals/GoalControls";
import NextGoalWidget from "../components/Goals/NextGoalWidget";

export default function GoalsPage() {
  const queryClient = useQueryClient();

  // Các state không đổi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [editMode, setEditMode] = useState("add");
  const [goalFilter, setGoalFilter] = useState("ALL");
  const [sortType, setSortType] = useState("PROGRESS");
  const [sortDirection, setSortDirection] = useState("desc");

  const {
    data: goalsData = { data: [], totalGoals: 0 },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["goals", goalFilter, sortType, sortDirection], // Thêm filter, sortType, sortDirection vào key
    queryFn: () =>
      getGoals({
        filter: goalFilter,
        sortType,
        sortDirection,
      }),
    select: (response) => response.data,
  });

  // ✅ SỬA LỖI: Wrap goals trong useMemo để tránh re-render không cần thiết
  const goals = useMemo(() => goalsData?.data || [], [goalsData]);

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getProfile,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5,
  });
  const userName = userProfile?.fullname || "Bạn";
  const userAvatar = userProfile?.avatar || null;

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      handleCloseConfirmDialog();
    },
  });

  // ✅ CẢI TIẾN: Tạo mutation riêng cho việc lưu trữ
  const toggleArchiveMutation = useMutation({
    mutationFn: toggleArchiveGoal, // Sử dụng hàm chuyên dụng từ service
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // ✅ CẢI TIẾN: Tạo mutation riêng cho việc ghim
  const togglePinMutation = useMutation({
    mutationFn: togglePinGoal, // Sử dụng hàm chuyên dụng từ service
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // ✅ CẢI TIẾN: Hàm handler giờ đơn giản hơn
  const handleToggleArchive = (goalId) => {
    toggleArchiveMutation.mutate(goalId);
  };

  // ✅ CẢI TIẾN: Hàm handler giờ đơn giản hơn
  const handleTogglePin = (goalId) => {
    togglePinMutation.mutate(goalId);
  };

  // Các hàm còn lại giữ nguyên
  const handleActionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    setIsModalOpen(false);
    setIsAddFundsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!goalToDelete) return;
    deleteMutation.mutate(goalToDelete);
  };

  const handleOpenAddModal = () => {
    setEditMode("add");
    setCurrentGoal(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (goal) => {
    setEditMode("edit");
    setCurrentGoal(goal);
    setIsModalOpen(true);
  };
  const handleOpenAddFundsModal = (goal) => {
    setCurrentGoal(goal);
    setIsAddFundsModalOpen(true);
  };
  const handleRequestDelete = (goalId) => {
    setGoalToDelete(goalId);
    setIsConfirmOpen(true);
  };
  const handleCloseConfirmDialog = () => {
    setIsConfirmOpen(false);
    setGoalToDelete(null);
  };

  // ✅ SỬA LỖI: Logic lọc goals được cải tiến
  const filteredGoals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredResults = [];

    switch (goalFilter) {
      case "IN_PROGRESS":
        filteredResults = goals.filter(
          (g) =>
            !g.archived &&
            g.currentAmount < g.targetAmount &&
            (!g.deadline || new Date(g.deadline) >= today)
        );
        break;
      case "COMPLETED":
        filteredResults = goals.filter(
          (g) => !g.archived && g.currentAmount >= g.targetAmount
        );
        break;
      case "OVERDUE":
        filteredResults = goals.filter(
          (g) =>
            !g.archived &&
            g.currentAmount < g.targetAmount &&
            g.deadline &&
            new Date(g.deadline) < today
        );
        break;
      case "ARCHIVED":
        // Chỉ trả về goals đã lưu trữ
        return goals.filter((g) => g.archived);
      case "ALL":
      default:
        filteredResults = goals.filter((g) => !g.archived);
        break;
    }

    // Sắp xếp: Goals được ghim lên đầu, sau đó đến goals thường
    const pinnedGoals = filteredResults.filter((g) => g.isPinned);
    const unpinnedGoals = filteredResults.filter((g) => !g.isPinned);

    return [...pinnedGoals, ...unpinnedGoals];
  }, [goals, goalFilter]);

  const getSmartContext = () => {
    if (isLoading) return "Đang tải mục tiêu của bạn...";
    if (error) return "Không thể tải mục tiêu.";
    const activeGoals = goals.filter((g) => !g.archived);
    if (activeGoals.length === 0) {
      return "Bạn chưa có mục tiêu nào. Hãy tạo một mục tiêu ngay!";
    }
    const ongoingGoals = activeGoals.filter(
      (g) => g.currentAmount < g.targetAmount
    ).length;
    const completedGoals = activeGoals.length - ongoingGoals;
    return `Bạn có ${ongoingGoals} mục tiêu đang thực hiện và đã hoàn thành ${completedGoals} mục tiêu. Cố lên!`;
  };

  const nextGoal = useMemo(() => {
    const now = new Date();
    const upcomingGoals = goals
      .filter(
        (g) =>
          !g.archived &&
          g.currentAmount < g.targetAmount &&
          g.deadline &&
          new Date(g.deadline) >= now
      )
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    return upcomingGoals.length > 0 ? upcomingGoals[0] : null;
  }, [goals]);

  return (
    <div>
      <Header userName={userName} userAvatar={userAvatar} />
      <Navbar />
      <main className={styles.pageWrapper}>
        <div className={styles.contentContainer}>
          <HeaderCard
            className={styles.goalsPageHeader}
            gridIcon={<FontAwesomeIcon icon={faBullseye} />}
            gridTitle={`${getGreeting()}, ${userName}!`}
            gridSubtitle="Hãy chinh phục các mục tiêu tài chính của bạn"
            gridStats={<NextGoalWidget goal={nextGoal} isLoading={isLoading} />}
            gridInfo={
              <>
                <div className="smartContext">
                  <span className="contextText">{getSmartContext()}</span>
                </div>
                <span className={headerStyles.miniStats}>{getFullDate()}</span>
              </>
            }
            gridAction={
              <Button
                onClick={handleOpenAddModal}
                icon={<FontAwesomeIcon icon={faPlus} />}
                variant="primary"
                loading={false}
              >
                Tạo mục tiêu mới
              </Button>
            }
          />
          <PageContentContainer
            title="Mục tiêu tài chính"
            titleIcon={faBullseye}
            titleIconColor="#4f46e5"
            headerExtra={
              <GoalControls
                filterValue={goalFilter}
                onFilterChange={setGoalFilter}
                sortType={sortType}
                sortDirection={sortDirection}
                onSortTypeChange={setSortType}
                onSortDirectionChange={setSortDirection}
              />
            }
          >
            {isLoading && (
              <div className={styles.loading}>Đang tải dữ liệu...</div>
            )}
            {error && (
              <div className={styles.error}>
                {"Đã có lỗi xảy ra: " + error.message}
              </div>
            )}
            {!isLoading && !error && (
              <GoalsList
                goals={filteredGoals}
                onEdit={handleOpenEditModal}
                onDelete={handleRequestDelete}
                onAddFunds={handleOpenAddFundsModal}
                onToggleArchive={handleToggleArchive}
                onTogglePin={handleTogglePin}
              />
            )}
          </PageContentContainer>
        </div>
      </main>

      {isModalOpen && (
        <AddEditGoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmitSuccess={handleActionSuccess}
          mode={editMode}
          initialData={currentGoal}
        />
      )}

      {isConfirmOpen && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() =>
            deleteMutation.isPending ? null : handleCloseConfirmDialog()
          }
          onConfirm={handleConfirmDelete}
          title="Xác nhận Xóa Mục tiêu"
          message="Bạn có chắc chắn muốn xóa mục tiêu này? Hành động này không thể hoàn tác."
          isProcessing={deleteMutation.isPending}
          errorMessage={deleteMutation.error?.response?.data?.message}
          confirmText="Xóa"
        />
      )}

      {isAddFundsModalOpen && (
        <AddFundsModal
          isOpen={isAddFundsModalOpen}
          onClose={() => setIsAddFundsModalOpen(false)}
          onSubmitSuccess={handleActionSuccess}
          goalData={currentGoal}
        />
      )}

      <Footer />
    </div>
  );
}

export const getGoalProgress = (goal) => {
  const targetAmount = Number(goal?.targetAmount) || 0;
  const currentAmount = Number(goal?.currentAmount) || 0;

  if (targetAmount <= 0) return 0;

  return Math.min((currentAmount / targetAmount) * 100, 100);
};

export const isGoalCompleted = (goal) =>
  Number(goal?.currentAmount) >= Number(goal?.targetAmount);

export const isGoalOverdue = (goal, now = new Date()) => {
  if (!goal?.deadline || isGoalCompleted(goal)) return false;

  const deadline = new Date(goal.deadline);
  if (Number.isNaN(deadline.getTime())) return false;

  return deadline < now;
};

export const compareGoals = (a, b, sortType, sortDirection) => {
  if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
    return a.isPinned ? -1 : 1;
  }

  const direction = sortDirection === "asc" ? 1 : -1;
  let valueA = 0;
  let valueB = 0;

  if (sortType === "PROGRESS") {
    valueA = getGoalProgress(a);
    valueB = getGoalProgress(b);
  } else if (sortType === "DEADLINE") {
    valueA = a.deadline ? new Date(a.deadline).getTime() : null;
    valueB = b.deadline ? new Date(b.deadline).getTime() : null;
  } else {
    valueA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    valueB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  }

  if (valueA === null && valueB === null) return 0;
  if (valueA === null) return 1;
  if (valueB === null) return -1;

  return (valueA - valueB) * direction;
};

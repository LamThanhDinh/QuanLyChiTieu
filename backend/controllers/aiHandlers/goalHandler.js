const mongoose = require("mongoose");
const Goal = require("../../models/Goal");

class GoalHandler {
  // Xử lý thêm mục tiêu
  async handleAddGoal(goal, userId, responseForUser) {
    try {
      console.log("=== HANDLING ADD GOAL ===");
      console.log("Goal input:", JSON.stringify(goal, null, 2));
      console.log("User ID:", userId);
      console.log("Response for user:", responseForUser);
      console.log("=== END HANDLING ADD GOAL DEBUG ===");

      if (!goal || !goal.name) {
        return {
          response: "Tên mục tiêu không được để trống. Vui lòng thử lại.",
          action: "CHAT_RESPONSE",
        };
      }

      // Kiểm tra nếu goal thiếu số tiền
      if (!goal.targetAmount || goal.targetAmount === null) {
        return {
          response:
            responseForUser ||
            `Bạn muốn đặt mục tiêu chi tiêu bao nhiêu cho "${goal.name}"? Ví dụ: "5 triệu" hoặc "5000000đ"`,
          action: "NEED_MORE_INFO",
          waitingFor: "goal_amount",
          pendingData: {
            name: goal.name,
            deadline: goal.deadline,
          },
        };
      }

      // Kiểm tra nếu goal thiếu deadline
      if (!goal.deadline || goal.deadline === null) {
        console.log("=== GOAL MISSING DEADLINE ===");
        console.log("Goal deadline:", goal.deadline);
        console.log("Setting up conversation state for deadline input...");

        const deadlineQuestion = `Mục tiêu ${Number(
          goal.targetAmount
        ).toLocaleString()}đ cho "${
          goal.name
        }". Bạn muốn hoàn thành vào lúc nào? (Ví dụ: "tháng 12 2025", "cuối năm", "31/12/2025")`;

        return {
          response: deadlineQuestion,
          action: "NEED_MORE_INFO",
          waitingFor: "goal_deadline",
          pendingData: {
            name: goal.name,
            targetAmount: goal.targetAmount,
          },
        };
      }

      // Nếu có đầy đủ thông tin thì confirm
      console.log("=== GOAL HAS ALL INFO, CONFIRMING ===");
      console.log("Final goal data:", {
        name: goal.name,
        targetAmount: goal.targetAmount,
        deadline: goal.deadline,
      });

      return {
        response:
          responseForUser ||
          `Xác nhận tạo mục tiêu:\n• Tên: ${
            goal.name
          }\n• Số tiền mục tiêu: ${Number(
            goal.targetAmount
          ).toLocaleString()}đ\n• Hạn: ${goal.deadline}`,
        action: "CONFIRM_ADD_GOAL",
        data: {
          name: goal.name,
          targetAmount: Number(goal.targetAmount),
          deadline: goal.deadline,
          icon: goal.icon || "🎯", // Sử dụng emoji giống như manual goal creation
        },
      };
    } catch (error) {
      console.error("Error handling add goal:", error);
      return {
        response:
          "Có lỗi xảy ra khi xử lý thông tin mục tiêu. Vui lòng thử lại.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Lấy mục tiêu với filter
  async getGoalListWithFilter(userId, entities) {
    try {
      let goalFilter = { user: userId, archived: false };
      let sortOrder = { isPinned: -1, createdAt: -1 };

      // Filter theo status nếu có
      if (entities?.statusFilter === "completed") {
        // Mục tiêu hoàn thành (currentAmount >= targetAmount)
        goalFilter = {
          ...goalFilter,
          $expr: { $gte: ["$currentAmount", "$targetAmount"] },
        };
      } else if (entities?.statusFilter === "overdue") {
        // Mục tiêu quá hạn
        goalFilter.deadline = { $lt: new Date() };
        goalFilter.$expr = { $lt: ["$currentAmount", "$targetAmount"] };
      } else if (entities?.statusFilter === "nearest_deadline") {
        // Mục tiêu sắp đến hạn (trong vòng 7 ngày)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        goalFilter.deadline = { $lte: nextWeek, $gte: new Date() };
        sortOrder = { deadline: 1 }; // Sắp xếp theo deadline gần nhất
      } else if (entities?.statusFilter === "active") {
        // Mục tiêu đang thực hiện
        goalFilter.$expr = { $lt: ["$currentAmount", "$targetAmount"] };
        goalFilter.deadline = { $gte: new Date() };
      }

      const goals = await Goal.find(goalFilter).sort(sortOrder).limit(10);

      if (goals.length === 0) {
        return {
          response: "Không tìm thấy mục tiêu nào phù hợp.",
          action: "CHAT_RESPONSE",
        };
      }

      let title = "🎯 <strong>Danh sách mục tiêu";
      if (entities?.statusFilter === "completed") {
        title += " đã hoàn thành";
      } else if (entities?.statusFilter === "overdue") {
        title += " quá hạn";
      } else if (entities?.statusFilter === "nearest_deadline") {
        title += " sắp đến hạn";
      } else if (entities?.statusFilter === "active") {
        title += " đang thực hiện";
      }
      title += ":</strong>";

      const goalList = goals
        .map((goal, index) => {
          const progress = (
            ((goal.currentAmount || 0) / goal.targetAmount) *
            100
          ).toFixed(1);
          const pinIcon = goal.isPinned ? "📌 " : "";
          const progressBar =
            progress >= 100 ? "✅" : progress >= 50 ? "🟡" : "🔴";

          // Format deadline với thông tin thời gian chi tiết
          let deadlineText = "";
          if (goal.deadline) {
            const deadlineDate = new Date(goal.deadline);
            const today = new Date();
            const diffTime = deadlineDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
              deadlineText = `⏰ Quá hạn ${Math.abs(
                diffDays
              )} ngày (${deadlineDate.toLocaleDateString("vi-VN")})`;
            } else if (diffDays === 0) {
              deadlineText = `⏰ Hết hạn hôm nay (${deadlineDate.toLocaleDateString(
                "vi-VN"
              )})`;
            } else if (diffDays <= 7) {
              deadlineText = `⏰ Còn ${diffDays} ngày (${deadlineDate.toLocaleDateString(
                "vi-VN"
              )})`;
            } else {
              deadlineText = `📅 Hạn: ${deadlineDate.toLocaleDateString(
                "vi-VN"
              )}`;
            }
          } else {
            deadlineText = "📅 Không có hạn cuối";
          }

          return `${index + 1}. ${pinIcon}<strong>${
            goal.name
          }</strong> ${progressBar}\n   💰 Tiến độ: <span class="progress">${(
            goal.currentAmount || 0
          ).toLocaleString()}đ / ${goal.targetAmount.toLocaleString()}đ (${progress}%)</span>\n   ${deadlineText}\n   ────────────────────────────────────────`;
        })
        .join("\n\n");

      return {
        response: `${title}\n\n${goalList}`,
        action: "CHAT_RESPONSE",
        data: {
          goals: goals.map((goal) => ({
            id: goal._id,
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount || 0,
            progress: (
              ((goal.currentAmount || 0) / goal.targetAmount) *
              100
            ).toFixed(1),
            isPinned: goal.isPinned,
            deadline: goal.deadline,
            formattedDeadline: goal.deadline
              ? new Date(goal.deadline).toLocaleDateString("vi-VN")
              : null,
            daysRemaining: goal.deadline
              ? Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null,
          })),
          filters: entities,
        },
      };
    } catch (error) {
      console.error("Error getting filtered goals:", error);
      return {
        response: "Có lỗi xảy ra khi lấy danh sách mục tiêu.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Parse date từ text cho goal deadline
  extractDate(text) {
    if (!text) return null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // Clean text
    const cleanText = text.toLowerCase().trim();

    // Patterns cho ngày cụ thể
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})\/(\d{1,2})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
      /(\d{1,2})-(\d{1,2})/,
      /ngày\s*(\d{1,2})\s*\/\s*(\d{1,2})/,
      /ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i,
      /ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})/i,
      /(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i,
      /(\d{1,2})\s*tháng\s*(\d{1,2})/i,
    ];

    // Kiểm tra ngày cụ thể trước
    for (const pattern of datePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        let day, month, year;

        if (pattern.source.includes("tháng")) {
          // Format: ngày X tháng Y [năm Z]
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = match[3] ? parseInt(match[3]) : currentYear;
        } else {
          // Format: X/Y[/Z] hoặc X-Y[-Z]
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = match[3] ? parseInt(match[3]) : currentYear;
        }

        if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
          return new Date(year, month - 1, day);
        }
      }
    }

    // Xử lý các ngày tương đối
    if (cleanText.includes("hôm nay")) {
      return now;
    }

    if (cleanText.includes("ngày mai")) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      return tomorrow;
    }

    if (cleanText.includes("tuần sau") || cleanText.includes("tuần tới")) {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      return nextWeek;
    }

    if (cleanText.includes("tháng sau") || cleanText.includes("tháng tới")) {
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      return nextMonth;
    }

    if (cleanText.includes("cuối năm")) {
      return new Date(currentYear, 11, 31); // 31/12
    }

    if (cleanText.includes("đầu năm sau")) {
      return new Date(currentYear + 1, 0, 31); // 31/1 năm sau
    }

    // Parse "tháng X năm Y"
    const monthYearMatch = cleanText.match(/tháng\s*(\d+)\s*năm\s*(\d+)/);
    if (monthYearMatch) {
      const month = parseInt(monthYearMatch[1]);
      const year = parseInt(monthYearMatch[2]);
      if (month >= 1 && month <= 12) {
        // Lấy ngày cuối tháng
        return new Date(year, month, 0);
      }
    }

    // Parse chỉ "tháng X" (năm hiện tại)
    const monthMatch = cleanText.match(/tháng\s*(\d+)/);
    if (monthMatch) {
      const month = parseInt(monthMatch[1]);
      if (month >= 1 && month <= 12) {
        // Lấy ngày cuối tháng
        return new Date(currentYear, month, 0);
      }
    }

    return null;
  }

  // Tạo goal thực tế trong database (được gọi từ routes)
  async createGoalInDB(goalData) {
    try {
      console.log("=== CREATING GOAL IN DATABASE ===");
      console.log("Goal data:", goalData);

      const newGoal = new Goal({
        ...goalData,
        user: goalData.userId, // Goal model sử dụng 'user' thay vì 'userId'
        currentAmount: 0,
        isPinned: false,
        archived: false,
      });

      const savedGoal = await newGoal.save();

      console.log("✅ Goal saved successfully:", savedGoal);
      return savedGoal;
    } catch (error) {
      console.error("❌ Error creating goal in DB:", error);
      throw error;
    }
  }
}

module.exports = GoalHandler;

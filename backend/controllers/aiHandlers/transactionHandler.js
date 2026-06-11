const mongoose = require("mongoose");
const Transaction = require("../../models/Transaction");
const Category = require("../../models/Category");
const Account = require("../../models/Account");

class TransactionHandler {
  // Xử lý thêm giao dịch
  async handleAddTransaction(
    transaction,
    userId,
    responseForUser,
    originalMessage = ""
  ) {
    try {
      // Kiểm tra nếu transaction thiếu thông tin
      if (!transaction || !transaction.amount || transaction.amount === null) {
        // Set conversation state để hỏi số tiền
        return {
          response:
            responseForUser ||
            `Bạn ${transaction?.type === "CHITIEU" ? "chi" : "thu"} "${
              transaction?.name || "giao dịch"
            }" hết bao nhiêu tiền?`,
          action: "NEED_MORE_INFO",
          waitingFor: "transaction_amount",
          pendingData: {
            name: transaction?.name || "Giao dịch mới",
            type: transaction?.type || "CHITIEU",
            accountGuess: transaction?.accountGuess,
            categoryGuess: transaction?.categoryGuess,
            originalMessage: originalMessage,
          },
        };
      }

      // Validate required fields
      if (!transaction.name || !transaction.type) {
        return {
          response: "Thông tin giao dịch không đầy đủ. Vui lòng thử lại.",
          action: "CHAT_RESPONSE",
        };
      }

      // Extract date từ originalMessage nếu có
      let transactionDate = new Date(); // Default là hôm nay
      if (originalMessage) {
        transactionDate =
          this.extractDateFromTransactionMessage(originalMessage);
        console.log("=== EXTRACTING DATE FROM ORIGINAL MESSAGE ===");
        console.log("Original message:", originalMessage);
        console.log("Extracted date:", transactionDate);
        console.log("=== END EXTRACT DATE ===");
      }

      // Format date cho hiển thị
      const formattedDate = transactionDate.toLocaleDateString("vi-VN");

      return {
        response:
          responseForUser ||
          `Xác nhận thêm giao dịch:\n• Tên: ${
            transaction.name
          }\n• Số tiền: ${Number(
            transaction.amount
          ).toLocaleString()}đ\n• Loại: ${
            transaction.type === "CHITIEU" ? "Chi tiêu" : "Thu nhập"
          }\n• Danh mục: ${
            transaction.categoryGuess || "Không xác định"
          }\n• Ngày: ${formattedDate}`,
        action: "CONFIRM_ADD_TRANSACTION",
        data: {
          name: transaction.name,
          amount: Number(transaction.amount),
          type: transaction.type,
          categoryGuess: transaction.categoryGuess,
          accountGuess: transaction.accountGuess,
          date: transactionDate,
        },
      };
    } catch (error) {
      console.error("Error handling add transaction:", error);
      return {
        response:
          "Có lỗi xảy ra khi xử lý thông tin giao dịch. Vui lòng thử lại.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Lấy giao dịch với filter từ entities
  async getTransactionsWithFilter(userId, entities, responseForUser) {
    try {
      console.log("=== GETTING TRANSACTIONS WITH FILTER ===");
      console.log("Entities:", JSON.stringify(entities, null, 2));

      const userObjectId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;

      // Tạo filter query dựa trên entities
      let transactionFilter = { userId: userObjectId };
      let dateFilter = {};

      // Filter theo thời gian
      if (entities?.timeFilter) {
        const timeInfo = this.parseTimeFilter(entities.timeFilter);
        if (timeInfo) {
          const startOfMonth = new Date(timeInfo.year, timeInfo.month - 1, 1);
          const endOfMonth = new Date(
            timeInfo.year,
            timeInfo.month,
            0,
            23,
            59,
            59,
            999
          );
          dateFilter = {
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          };
        }
      }

      // Filter theo danh mục
      if (entities?.categoryFilter) {
        const category = await Category.findOne({
          userId: userObjectId,
          name: { $regex: new RegExp(entities.categoryFilter, "i") },
        });
        if (category) {
          transactionFilter.categoryId = category._id;
        }
      }

      // Filter theo tài khoản
      if (entities?.specificAccount) {
        const account = await Account.findOne({
          userId: userObjectId,
          name: { $regex: new RegExp(entities.specificAccount, "i") },
        });
        if (account) {
          transactionFilter.accountId = account._id;
        }
      }

      // Filter theo số tiền
      if (entities?.amountFilter) {
        const amountCondition = this.parseAmountFilter(entities.amountFilter);
        if (amountCondition) {
          transactionFilter.amount = amountCondition;
        }
      }

      // Combine filters
      const finalFilter = { ...transactionFilter, ...dateFilter };
      console.log("Transaction filter:", finalFilter);

      const transactions = await Transaction.find(finalFilter)
        .sort({ date: -1 })
        .limit(20)
        .populate("categoryId", "name type")
        .populate("accountId", "name type");

      if (transactions.length === 0) {
        return {
          response:
            responseForUser ||
            "Không tìm thấy giao dịch nào phù hợp với điều kiện.",
          action: "CHAT_RESPONSE",
        };
      }

      // Tạo tiêu đề phù hợp với filter
      let title = "📋 <strong>Giao dịch";
      if (entities?.categoryFilter) title += ` ${entities.categoryFilter}`;
      if (entities?.timeFilter) title += ` ${entities.timeFilter}`;
      if (entities?.specificAccount) title += ` từ ${entities.specificAccount}`;
      title += ":</strong>";

      const transactionList = transactions
        .map((t, index) => {
          const typeIcon = t.type === "CHITIEU" ? "💸" : "💰";
          const amount = t.amount ? t.amount.toLocaleString() : "0";
          const formattedDate = new Date(t.date).toLocaleDateString("vi-VN");

          return `${index + 1}. ${typeIcon} ${t.name} - ${amount}đ
   📂 ${t.categoryId?.name || "Không có danh mục"}
   🏦 ${t.accountId?.name || "Không có tài khoản"}
   📅 ${formattedDate}`;
        })
        .join("\n\n");

      return {
        response: `${title}\n\n${transactionList}`,
        action: "CHAT_RESPONSE",
        data: {
          transactions: transactions.map((t) => ({
            id: t._id,
            name: t.name,
            amount: t.amount,
            type: t.type,
            category: t.categoryId?.name,
            account: t.accountId?.name,
            date: t.date,
          })),
          filters: entities,
        },
      };
    } catch (error) {
      console.error("Error getting filtered transactions:", error);
      return {
        response: "Có lỗi xảy ra khi lấy danh sách giao dịch.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Xử lý tìm kiếm giao dịch với filter
  async handleQueryTransactionsWithFilter(userId, entities, responseForUser) {
    try {
      const userObjectId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;

      let transactionFilter = { userId: userObjectId };

      // Filter theo search term
      if (entities?.searchTerm) {
        transactionFilter.name = {
          $regex: new RegExp(entities.searchTerm, "i"),
        };
      }

      // Filter theo amount range
      if (entities?.amountFilter) {
        const amountCondition = this.parseAmountFilter(entities.amountFilter);
        if (amountCondition) {
          transactionFilter.amount = amountCondition;
        }
      }

      // Filter theo time
      if (entities?.timeFilter) {
        const timeInfo = this.parseTimeFilter(entities.timeFilter);
        if (timeInfo) {
          const startOfMonth = new Date(timeInfo.year, timeInfo.month - 1, 1);
          const endOfMonth = new Date(
            timeInfo.year,
            timeInfo.month,
            0,
            23,
            59,
            59,
            999
          );
          transactionFilter.date = {
            $gte: startOfMonth,
            $lte: endOfMonth,
          };
        }
      }

      const transactions = await Transaction.find(transactionFilter)
        .sort({ date: -1 })
        .limit(20)
        .populate("categoryId", "name type")
        .populate("accountId", "name type");

      if (transactions.length === 0) {
        return {
          response: "Không tìm thấy giao dịch nào phù hợp với tìm kiếm.",
          action: "CHAT_RESPONSE",
        };
      }

      let title = "🔍 <strong>Kết quả tìm kiếm";
      if (entities?.searchTerm) title += ` "${entities.searchTerm}"`;
      if (entities?.amountFilter) title += ` (${entities.amountFilter})`;
      title += ":</strong>";

      const transactionList = transactions
        .map((t, index) => {
          const typeIcon = t.type === "CHITIEU" ? "💸" : "💰";
          const amount = t.amount ? t.amount.toLocaleString() : "0";
          const formattedDate = new Date(t.date).toLocaleDateString("vi-VN");

          return `${index + 1}. ${typeIcon} ${t.name} - ${amount}đ\n   📂 ${
            t.categoryId?.name || "Không có danh mục"
          }\n   📅 ${formattedDate}`;
        })
        .join("\n\n");

      return {
        response: `${title}\n\n${transactionList}`,
        action: "CHAT_RESPONSE",
        data: {
          transactions: transactions.map((t) => ({
            id: t._id,
            name: t.name,
            amount: t.amount,
            type: t.type,
            category: t.categoryId?.name,
            account: t.accountId?.name,
            date: t.date,
          })),
          searchFilters: entities,
        },
      };
    } catch (error) {
      console.error("Error querying transactions:", error);
      return {
        response: "Có lỗi xảy ra khi tìm kiếm giao dịch.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Parse time filter thành month/year
  parseTimeFilter(timeFilter) {
    if (!timeFilter) return null;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const lowerFilter = timeFilter.toLowerCase();

    if (
      lowerFilter.includes("tháng này") ||
      lowerFilter.includes("this month")
    ) {
      return { month: currentMonth, year: currentYear };
    }

    if (
      lowerFilter.includes("tháng trước") ||
      lowerFilter.includes("last month")
    ) {
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      return { month: lastMonth, year: lastYear };
    }

    // Parse "tháng X"
    const monthMatch = lowerFilter.match(/tháng\s*(\d+)/);
    if (monthMatch) {
      const month = parseInt(monthMatch[1]);
      if (month >= 1 && month <= 12) {
        return { month, year: currentYear };
      }
    }

    return null;
  }

  // Parse amount filter thành MongoDB condition
  parseAmountFilter(amountFilter) {
    if (!amountFilter) return null;

    const lowerFilter = amountFilter.toLowerCase();

    // "trên X"
    const aboveMatch = lowerFilter.match(/trên\s*(\d+)/);
    if (aboveMatch) {
      return { $gt: parseInt(aboveMatch[1]) };
    }

    // "dưới X"
    const belowMatch = lowerFilter.match(/dưới\s*(\d+)/);
    if (belowMatch) {
      return { $lt: parseInt(belowMatch[1]) };
    }

    // "từ X đến Y"
    const rangeMatch = lowerFilter.match(/từ\s*(\d+)\s*đến\s*(\d+)/);
    if (rangeMatch) {
      return {
        $gte: parseInt(rangeMatch[1]),
        $lte: parseInt(rangeMatch[2]),
      };
    }

    return null;
  }

  // Extract date từ transaction message
  extractDateFromTransactionMessage(message) {
    // Implementation chi tiết cho extract date
    const now = new Date();
    const cleanMessage = message.toLowerCase().trim();

    // Các pattern ngày cụ thể
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})\/(\d{1,2})/,
      /ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})/i,
    ];

    for (const pattern of datePatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = match[3] ? parseInt(match[3]) : now.getFullYear();

        if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
          return new Date(year, month - 1, day);
        }
      }
    }

    // Các ngày tương đối
    if (cleanMessage.includes("hôm qua")) {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return yesterday;
    }

    if (cleanMessage.includes("ngày mai")) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      return tomorrow;
    }

    // Mặc định là hôm nay
    return now;
  }

  // Tạo transaction thực tế trong database (được gọi từ routes)
  async createTransactionInDB(transactionData) {
    try {
      console.log("=== CREATING TRANSACTION IN DATABASE ===");
      console.log("Transaction data:", transactionData);

      const { name, amount, type, categoryGuess, accountGuess, date, userId } =
        transactionData;

      // Kiểm tra user có ít nhất 1 account không
      const userAccountCount = await Account.countDocuments({ userId: userId });
      if (userAccountCount === 0) {
        throw new Error(
          "Người dùng chưa có tài khoản nào. Vui lòng tạo tài khoản trước khi thêm giao dịch."
        );
      }

      // Tìm category và account phù hợp
      let categoryId = null;
      let accountId = null;

      const fallbackCategoryName =
        categoryGuess || (type === "THUNHAP" ? "Thu nhập khác" : "Hóa đơn");

      // Tìm category
      const categorySearchTerms = [categoryGuess, fallbackCategoryName, name].filter(
        Boolean
      );

      for (const term of categorySearchTerms) {
        const category = await Category.findOne({
          userId: userId,
          name: { $regex: new RegExp(term, "i") },
        });

        if (category) {
          categoryId = category._id;
          break;
        }
      }

      if (!categoryId) {
        const fallbackCategory = await Category.create({
          userId: userId,
          name: fallbackCategoryName,
          type: type || "CHITIEU",
          icon: type === "THUNHAP" ? "fa-money-bill-wave" : "fa-receipt",
        });
        categoryId = fallbackCategory._id;
      }

      // Tìm account
      if (accountGuess) {
        const account = await Account.findOne({
          userId: userId,
          name: { $regex: new RegExp(accountGuess, "i") },
        });
        if (account) {
          accountId = account._id;
        }
      }

      // Nếu không tìm thấy account, lấy account đầu tiên
      if (!accountId) {
        const firstAccount = await Account.findOne({ userId: userId });
        if (firstAccount) {
          accountId = firstAccount._id;
        } else {
          throw new Error(
            "Không tìm thấy tài khoản nào. Vui lòng tạo tài khoản trước."
          );
        }
      }

      // Tạo transaction mới
      const newTransaction = new Transaction({
        name,
        amount,
        type,
        categoryId,
        accountId,
        date: date || new Date(),
        userId: userId,
      });

      const savedTransaction = await newTransaction.save();
      console.log("✅ Transaction saved successfully:", savedTransaction);

      return savedTransaction;
    } catch (error) {
      console.error("❌ Error creating transaction in DB:", error);
      throw error;
    }
  }
}

module.exports = TransactionHandler;

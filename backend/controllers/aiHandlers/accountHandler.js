const mongoose = require("mongoose");
const Account = require("../../models/Account");
const Transaction = require("../../models/Transaction");

class AccountHandler {
  // Xử lý thêm tài khoản
  async handleAddAccount(account, userId, responseForUser) {
    try {
      if (!account || !account.name) {
        return {
          response: "Tên tài khoản không được để trống. Vui lòng thử lại.",
          action: "CHAT_RESPONSE",
        };
      }

      // Set default type nếu không có
      const accountType = account.type || "TIENMAT";
      const bankName = account.bankName || null;

      console.log("=== CREATING ACCOUNT ===");
      console.log("Account data:", JSON.stringify(account, null, 2));
      console.log("User ID:", userId);

      // Trả về confirmation thay vì tự động tạo
      const initialBalance = account.initialBalance || 0;
      const balanceText =
        initialBalance > 0
          ? ` với số dư ban đầu ${initialBalance.toLocaleString()}đ`
          : "";

      return {
        response:
          responseForUser ||
          `Xác nhận tạo tài khoản "${account.name}" loại ${
            accountType === "TIENMAT" ? "tiền mặt" : "thẻ ngân hàng"
          }${bankName ? ` của ${bankName}` : ""}${balanceText}?`,
        action: "CONFIRM_ADD_ACCOUNT",
        data: {
          name: account.name,
          type: accountType,
          bankName: bankName,
          accountNumber: account.accountNumber || "",
          initialBalance: initialBalance,
        },
      };
      
    } catch (error) {
      console.error("Error handling add account:", error);
      return {
        response: "Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Helper function để tạo account trong DB
  async createAccountInDB(accountData) {
    try {
      console.log("=== CREATING ACCOUNT IN DATABASE ===");
      console.log("Account data to save:", accountData);

      const newAccount = new Account(accountData);
      const savedAccount = await newAccount.save();

      console.log("✅ Account saved successfully:", savedAccount);
      return savedAccount;
    } catch (error) {
      console.error("❌ Error saving account to database:", error);
      throw error;
    }
  }

  // Lấy danh sách tài khoản với filter từ entities
  async getAccountListWithFilter(userId, entities) {
    try {
      console.log("=== GETTING ACCOUNTS WITH FILTER ===");
      console.log("Entities:", JSON.stringify(entities, null, 2));

      const userObjectId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;

      // Tạo filter query dựa trên entities
      let accountFilter = { userId: userObjectId };

      // Filter theo tài khoản cụ thể
      if (entities?.specificAccount) {
        accountFilter.name = {
          $regex: new RegExp(entities.specificAccount, "i"),
        };
      }

      // Filter theo ngân hàng
      if (entities?.bankFilter) {
        accountFilter.bankName = {
          $regex: new RegExp(entities.bankFilter, "i"),
        };
      }

      console.log("Account filter:", accountFilter);

      const accounts = await Account.find(accountFilter);

      if (accounts.length === 0) {
        const filterText = entities?.specificAccount
          ? `tài khoản "${entities.specificAccount}"`
          : entities?.bankFilter
          ? `ngân hàng "${entities.bankFilter}"`
          : "tài khoản";

        return {
          response: `Không tìm thấy ${filterText} nào.`,
          action: "CHAT_RESPONSE",
        };
      }

      console.log("Found filtered accounts:", accounts.length);

      let totalBalance = 0;
      const accountsWithBalance = [];

      // Tính balance thực cho mỗi account
      for (const account of accounts) {
        const initialBalance = account.initialBalance || 0;

        const transactions = await Transaction.find({
          userId: userObjectId,
          accountId: account._id,
        });

        const accountTransactionSum = transactions.reduce(
          (sum, transaction) => {
            if (transaction.type === "THUNHAP") {
              return sum + (transaction.amount || 0);
            } else if (transaction.type === "CHITIEU") {
              return sum - (transaction.amount || 0);
            }
            return sum;
          },
          0
        );

        const realBalance = initialBalance + accountTransactionSum;
        totalBalance += realBalance;

        accountsWithBalance.push({
          ...account.toObject(),
          realBalance,
        });
      }

      // Tạo tiêu đề phù hợp với filter
      let title = "💼 <strong>Danh sách tài khoản";
      if (entities?.specificAccount) {
        title += ` "${entities.specificAccount}"`;
      } else if (entities?.bankFilter) {
        title += ` ${entities.bankFilter}`;
      }
      title += ":</strong>";

      const accountList = accountsWithBalance
        .map((acc, index) => {
          const typeText =
            acc.type === "TIENMAT" ? "💵 Tiền mặt" : "🏦 Ngân hàng";
          const bankInfo = acc.bankName ? ` (${acc.bankName})` : "";
          const balance = acc.realBalance;
          const balanceColor = balance >= 0 ? "positive" : "negative";
          return `${index + 1}. <strong>${
            acc.name
          }</strong> ${typeText}${bankInfo} - <span class="balance ${balanceColor}">${balance.toLocaleString()}đ</span>`;
        })
        .join("\n");

      return {
        response: `${title}\n\n${accountList}\n\n<strong>Tổng số dư: ${totalBalance.toLocaleString()}đ</strong>`,
        action: "CHAT_RESPONSE",
        data: {
          accounts: accountsWithBalance.map((acc) => ({
            id: acc._id,
            name: acc.name,
            type: acc.type,
            balance: acc.realBalance,
            initialBalance: acc.initialBalance || 0,
            bankName: acc.bankName,
          })),
          totalBalance,
          filters: entities,
        },
      };
    } catch (error) {
      console.error("Error getting filtered account list:", error);
      return {
        response: "Có lỗi xảy ra khi lấy danh sách tài khoản.",
        action: "CHAT_RESPONSE",
      };
    }
  }
}

module.exports = AccountHandler;

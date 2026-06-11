const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

// Hàm định dạng ngày thành YYYY-MM-DD để log lỗi cho dễ
const toISODateString = (date) => {
  if (!date) return "N/A";
  return new Date(date).toISOString().split("T")[0];
};
const toFloat = (value) => {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value.toString) {
    return parseFloat(value.toString());
  }
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};
exports.getAccounts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate } = req.query;

    // 1. Lấy danh sách tài khoản
    const accounts = await Account.find({ userId }).lean();
    if (accounts.length === 0) {
      return res.json([]);
    }

    const isTimeFilterActive = startDate && endDate;

    // 2. Lấy TOÀN BỘ giao dịch của người dùng một lần duy nhất
    const allTransactions = await Transaction.find({ userId }).lean();

    // 3. Xử lý và tính toán ở phía server (thay vì nhiều truy vấn DB)
    const formattedAccounts = accounts.map((account) => {
      const accountIdStr = account._id.toString();

      // Lọc giao dịch cho từng tài khoản
      const accountTransactions = allTransactions.filter(
        (t) => t.accountId.toString() === accountIdStr
      );

      let incomeInRange = 0;
      let expenseInRange = 0;
      let totalIncomeUntilEnd = 0;
      let totalExpenseUntilEnd = 0;

      for (const t of accountTransactions) {
        const transactionDate = new Date(t.date);

        // Tính thu/chi TRONG KỲ
        if (isTimeFilterActive) {
          if (
            transactionDate >= new Date(startDate) &&
            transactionDate <= new Date(endDate)
          ) {
            if (t.type === "THUNHAP") {
              incomeInRange += t.amount;
            } else if (t.type === "CHITIEU") {
              expenseInRange += t.amount;
            }
          }
        }

        // Tính số dư CUỐI KỲ
        // Nếu có filter, tính đến endDate. Nếu không, tính đến hiện tại.
        const endPointDate = isTimeFilterActive
          ? new Date(endDate)
          : new Date();
        if (transactionDate <= endPointDate) {
          if (t.type === "THUNHAP") {
            totalIncomeUntilEnd += t.amount;
          } else if (t.type === "CHITIEU") {
            totalExpenseUntilEnd += t.amount;
          }
        }
      }

      // Số dư cuối kỳ = Số dư ban đầu CỐ ĐỊNH + tổng thu - tổng chi
      const balanceAtEndDate =
        account.initialBalance + totalIncomeUntilEnd - totalExpenseUntilEnd;

      return {
        id: account._id,
        name: account.name,
        type: account.type,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        createdAt: account.createdAt,
        balance: balanceAtEndDate,
        monthlyIncome: incomeInRange,
        monthlyExpense: expenseInRange,
      };
    });

    res.json(formattedAccounts);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách tài khoản:", err);
    res
      .status(500)
      .json({ error: "Lỗi máy chủ nội bộ.", details: err.message });
  }
};
exports.createAccount = async (req, res) => {
  // Logic tạo tài khoản của bạn ở đây
  try {
    const { name, type, initialBalance, bankName, accountNumber } = req.body;
    const newAccount = new Account({
      userId: req.user.id,
      name,
      type,
      initialBalance,
      bankName: type === "THENGANHANG" ? bankName : "",
      accountNumber: type === "THENGANHANG" ? accountNumber : "",
    });
    const saved = await newAccount.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  // Logic cập nhật của bạn ở đây
  try {
    const { name, bankName, accountNumber } = req.body;
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { name, bankName, accountNumber } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản." });
    }
    res.json(account);
  } catch (err) {
    console.error("CHI TIẾT LỖI UPDATE:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  // Logic xóa của bạn ở đây
  try {
    const deletedAccount = await Account.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deletedAccount) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản." });
    }
    // TODO: Cân nhắc xử lý các giao dịch liên quan đến tài khoản này
    res.json({ message: "Xóa tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

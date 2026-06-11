// Helper method để tạo account trong database từ AI logic
AIController.prototype.createAccountInDB = async function (accountData) {
  try {
    const Account = require("../models/Account");

    // Kiểm tra tài khoản trùng tên
    const existingAccount = await Account.findOne({
      userId: accountData.userId,
      name: accountData.name,
    });

    if (existingAccount) {
      throw new Error(`Tài khoản "${accountData.name}" đã tồn tại`);
    }

    // Tạo account mới
    const newAccount = new Account({
      name: accountData.name,
      type: accountData.type,
      bankName: accountData.bankName,
      accountNumber: accountData.accountNumber,
      balance: accountData.initialBalance,
      userId: accountData.userId,
    });

    const savedAccount = await newAccount.save();
    console.log("✅ Account saved to DB:", savedAccount);

    return savedAccount;
  } catch (error) {
    console.error("Error creating account in DB:", error);
    throw error;
  }
};

// Export the controller
module.exports = AIController;

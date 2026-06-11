// backend/controllers/setupController.js
const Category = require("../models/Category");
const Account = require("../models/Account");

/**
 * Tạo dữ liệu mặc định cho người dùng mới
 */
const createDefaultData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Kiểm tra xem user đã có dữ liệu chưa
    const existingCategories = await Category.countDocuments({ userId });
    const existingAccounts = await Account.countDocuments({ userId });

    if (existingCategories > 0 && existingAccounts > 0) {
      return res.status(400).json({
        message: "Người dùng đã có dữ liệu, không cần tạo mặc định",
      });
    }

    // Tạo các categories mặc định
    const defaultCategories = [
      // Categories cho Chi tiêu
      { name: "Ăn uống", type: "CHITIEU", icon: "fa-utensils", userId },
      { name: "Di chuyển", type: "CHITIEU", icon: "fa-car", userId },
      { name: "Mua sắm", type: "CHITIEU", icon: "fa-shopping-cart", userId },
      { name: "Giải trí", type: "CHITIEU", icon: "fa-gamepad", userId },
      { name: "Y tế", type: "CHITIEU", icon: "fa-medkit", userId },
      { name: "Học tập", type: "CHITIEU", icon: "fa-book", userId },
      { name: "Hóa đơn", type: "CHITIEU", icon: "fa-file-invoice", userId },
      { name: "Khác", type: "CHITIEU", icon: "fa-ellipsis-h", userId },

      // Categories cho Thu nhập
      { name: "Lương", type: "THUNHAP", icon: "fa-money-bill-wave", userId },
      { name: "Thưởng", type: "THUNHAP", icon: "fa-gift", userId },
      { name: "Đầu tư", type: "THUNHAP", icon: "fa-chart-line", userId },
      { name: "Freelance", type: "THUNHAP", icon: "fa-laptop", userId },
      { name: "Bán hàng", type: "THUNHAP", icon: "fa-store", userId },
      {
        name: "Thu nhập khác",
        type: "THUNHAP",
        icon: "fa-plus-circle",
        userId,
      },
    ];

    // Tạo account mặc định
    const defaultAccounts = [
      {
        name: "Tiền mặt",
        type: "TIENMAT",
        initialBalance: 0,
        userId,
      },
      {
        name: "Tài khoản ngân hàng",
        type: "THENGANHANG",
        initialBalance: 0,
        bankName: "",
        accountNumber: "",
        userId,
      },
    ];

    // Tạo categories
    let createdCategories = [];
    if (existingCategories === 0) {
      createdCategories = await Category.insertMany(defaultCategories);
    }

    // Tạo accounts
    let createdAccounts = [];
    if (existingAccounts === 0) {
      createdAccounts = await Account.insertMany(defaultAccounts);
    }

    res.status(201).json({
      message: "Tạo dữ liệu mặc định thành công",
      data: {
        categories: createdCategories.length,
        accounts: createdAccounts.length,
      },
    });
  } catch (error) {
    console.error("Error creating default data:", error);
    res.status(500).json({
      message: "Lỗi khi tạo dữ liệu mặc định",
      error: error.message,
    });
  }
};

/**
 * Kiểm tra trạng thái dữ liệu của người dùng
 */
const checkUserDataStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const categoriesCount = await Category.countDocuments({ userId });
    const accountsCount = await Account.countDocuments({ userId });

    const hasMinimumData = categoriesCount > 0 && accountsCount > 0;

    res.json({
      hasCategories: categoriesCount > 0,
      hasAccounts: accountsCount > 0,
      hasMinimumData,
      counts: {
        categories: categoriesCount,
        accounts: accountsCount,
      },
    });
  } catch (error) {
    console.error("Error checking user data status:", error);
    res.status(500).json({
      message: "Lỗi khi kiểm tra trạng thái dữ liệu",
      error: error.message,
    });
  }
};

module.exports = {
  createDefaultData,
  checkUserDataStatus,
};

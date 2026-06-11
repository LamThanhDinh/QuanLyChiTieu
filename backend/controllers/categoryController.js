const Category = require("../models/Category");
const mongoose = require("mongoose"); //  Bắt buộc để sử dụng mongoose.Types.ObjectId

const Transaction = require("../models/Transaction");
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period, year, month, date, includeGoalCategories } = req.query;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    //  SỬA: Lọc bỏ goal categories trừ khi được yêu cầu explicitly
    const categoryFilter = { userId };
    if (includeGoalCategories !== "true") {
      categoryFilter.isGoalCategory = { $ne: true };
    }

    const categories = await Category.find(categoryFilter).sort({
      createdAt: -1,
    });

    //  BẮT ĐẦU SỬA: Xây dựng bộ lọc thời gian cho aggregation
    const matchTimeFilter = {};
    let startDate, endDate;

    if (period) {
      switch (period) {
        case "year":
          if (year) {
            const parsedYear = parseInt(year);
            startDate = new Date(Date.UTC(parsedYear, 0, 1));
            endDate = new Date(Date.UTC(parsedYear, 11, 31, 23, 59, 59));
          }
          break;
        case "month":
          if (year && month) {
            const parsedYear = parseInt(year);
            const parsedMonth = parseInt(month);
            startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1));
            endDate = new Date(
              Date.UTC(parsedYear, parsedMonth, 0, 23, 59, 59)
            );
          }
          break;
        case "week":
          if (date) {
            const referenceDate = new Date(date);
            referenceDate.setUTCHours(0, 0, 0, 0);
            // Tính ngày đầu tuần (Chủ nhật)
            const dayOfWeek = referenceDate.getUTCDay();
            startDate = new Date(referenceDate);
            startDate.setUTCDate(referenceDate.getUTCDate() - dayOfWeek);
            // Tính ngày cuối tuần (Thứ bảy)
            endDate = new Date(startDate);
            endDate.setUTCDate(startDate.getUTCDate() + 6);
            endDate.setUTCHours(23, 59, 59, 999);
          }
          break;
      }
      if (startDate && endDate) {
        matchTimeFilter.date = { $gte: startDate, $lte: endDate };
      }
    }

    // Tính tổng giao dịch theo danh mục với bộ lọc thời gian
    const totals = await Transaction.aggregate([
      { $match: { userId: userObjectId, ...matchTimeFilter } }, //Thêm bộ lọc thời gian vào đây
      {
        $group: {
          _id: "$categoryId",
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 }, //  THÊM: Đếm số lượng giao dịch
        },
      },
    ]);
    //  KẾT THÚC SỬA

    // Chuyển totals thành object dễ lookup (không thay đổi)
    const totalMap = {};
    totals.forEach((item) => {
      totalMap[item._id.toString()] = {
        totalAmount: item.totalAmount,
        transactionCount: item.transactionCount, //  THÊM: Lưu số lượng giao dịch
      };
    });

    // Gắn thêm totalAmount và transactionCount vào từng danh mục
    const categoriesWithTotal = categories.map((cat) => {
      const categoryData = totalMap[cat._id.toString()] || {
        totalAmount: 0,
        transactionCount: 0,
      };
      return {
        ...cat.toObject(),
        totalAmount: categoryData.totalAmount,
        transactionCount: categoryData.transactionCount, //  THÊM: Thêm số lượng giao dịch
      };
    });

    res.status(200).json(categoriesWithTotal);
  } catch (err) {
    console.error("Lỗi khi lấy danh mục:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// [POST] /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, type, icon } = req.body;
    const userId = req.user.id;

    if (!name || !type) {
      return res.status(400).json({ message: "Thiếu tên hoặc loại danh mục" });
    }

    const newCategory = await Category.create({
      name,
      type,
      icon: icon || "fa-question-circle",
      userId,
    });

    res.status(201).json(newCategory);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo danh mục", error: err.message });
  }
};

// [PUT] /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const { name, type, icon } = req.body;
    const { id } = req.params;
    const userId = req.user.id;

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
star
    category.name = name || category.name;
    category.type = type || category.type;
    category.icon = icon || category.icon;

    await category.save();

    res.status(200).json(category);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật danh mục", error: err.message });
  }
};

// [DELETE] /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const category = await Category.findOneAndDelete({ _id: id, userId });
    if (!category) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy danh mục để xóa" });
    }

    res.status(200).json({ message: "Xóa danh mục thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa danh mục", error: err.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

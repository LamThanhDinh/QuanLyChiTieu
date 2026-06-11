const mongoose = require("mongoose");
const Category = require("../../models/Category");

class CategoryHandler {
  // Xử lý thêm danh mục
  async handleAddCategory(category, userId, responseForUser) {
    try {
      if (!category || !category.name || !category.type) {
        return {
          response: "Thông tin danh mục không đầy đủ. Vui lòng thử lại.",
          action: "CHAT_RESPONSE",
        };
      }

      return {
        response:
          responseForUser ||
          `Xác nhận tạo danh mục:\n• Tên: ${category.name}\n• Loại: ${
            category.type === "CHITIEU" ? "Chi tiêu" : "Thu nhập"
          }`,
        action: "CONFIRM_ADD_CATEGORY",
        data: {
          name: category.name,
          type: category.type,
          icon: this.getCategoryIcon(category.name, category.type),
        },
      };
    } catch (error) {
      console.error("Error handling add category:", error);
      return {
        response:
          "Có lỗi xảy ra khi xử lý thông tin danh mục. Vui lòng thử lại.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Lấy danh mục với filter
  async getCategoryListWithFilter(userId, entities) {
    try {
      const userObjectId =
        typeof userId === "string"
          ? new mongoose.Types.ObjectId(userId)
          : userId;

      let categoryFilter = { userId: userObjectId };

      // Filter theo type nếu có
      if (entities?.typeFilter) {
        categoryFilter.type = entities.typeFilter;
      }

      const categories = await Category.find(categoryFilter).sort({
        type: 1,
        name: 1,
      });

      if (categories.length === 0) {
        return {
          response: "Không tìm thấy danh mục nào phù hợp.",
          action: "CHAT_RESPONSE",
        };
      }

      const incomeCategories = categories.filter((c) => c.type === "THUNHAP");
      const expenseCategories = categories.filter((c) => c.type === "CHITIEU");

      let responseText = "📂 <strong>Danh sách danh mục";
      if (entities?.typeFilter === "CHITIEU") {
        responseText += " chi tiêu";
      } else if (entities?.typeFilter === "THUNHAP") {
        responseText += " thu nhập";
      }
      responseText += ":</strong>\n\n";

      if (entities?.typeFilter !== "THUNHAP" && expenseCategories.length > 0) {
        responseText += "💸 <strong>Chi tiêu:</strong>\n";
        responseText += expenseCategories
          .map((cat, index) => `${index + 1}. ${cat.icon || "📂"} ${cat.name}`)
          .join("\n");
        responseText += "\n\n";
      }

      if (entities?.typeFilter !== "CHITIEU" && incomeCategories.length > 0) {
        responseText += "💰 <strong>Thu nhập:</strong>\n";
        responseText += incomeCategories
          .map((cat, index) => `${index + 1}. ${cat.icon || "💰"} ${cat.name}`)
          .join("\n");
      }

      return {
        response: responseText.trim(),
        action: "CHAT_RESPONSE",
        data: {
          categories: categories.map((cat) => ({
            id: cat._id,
            name: cat.name,
            type: cat.type,
            icon: cat.icon,
          })),
          filters: entities,
        },
      };
    } catch (error) {
      console.error("Error getting filtered categories:", error);
      return {
        response: "Có lỗi xảy ra khi lấy danh sách danh mục.",
        action: "CHAT_RESPONSE",
      };
    }
  }

  // Hàm thông minh để gợi ý icon cho category dựa trên tên
  getCategoryIcon(categoryName, categoryType) {
    if (!categoryName) return "❓";

    const name = categoryName.toLowerCase().trim();
    const type = categoryType || "CHITIEU";

    // Icons cho chi tiêu (CHITIEU)
    if (type === "CHITIEU") {
      // Ăn uống
      if (
        name.includes("ăn") ||
        name.includes("uống") ||
        name.includes("thức ăn") ||
        name.includes("đồ ăn") ||
        name.includes("food") ||
        name.includes("restaurant") ||
        name.includes("cafe") ||
        name.includes("coffee") ||
        name.includes("nước") ||
        name.includes("drink") ||
        name.includes("bữa") ||
        name.includes("cơm") ||
        name.includes("phở") ||
        name.includes("bún") ||
        name.includes("trà") ||
        name.includes("bia") ||
        name.includes("rượu")
      ) {
        return "🍽️";
      }

      // Di chuyển
      if (
        name.includes("xe") ||
        name.includes("xăng") ||
        name.includes("gas") ||
        name.includes("fuel") ||
        name.includes("giao thông") ||
        name.includes("transport") ||
        name.includes("taxi") ||
        name.includes("grab") ||
        name.includes("uber") ||
        name.includes("bus") ||
        name.includes("xe buýt") ||
        name.includes("metro") ||
        name.includes("tàu") ||
        name.includes("máy bay") ||
        name.includes("flight") ||
        name.includes("vé")
      ) {
        return "🚗";
      }

      // Mua sắm
      if (
        name.includes("mua") ||
        name.includes("shopping") ||
        name.includes("sắm") ||
        name.includes("quần áo") ||
        name.includes("clothes") ||
        name.includes("fashion") ||
        name.includes("giày") ||
        name.includes("túi") ||
        name.includes("bag") ||
        name.includes("shoes") ||
        name.includes("đồ dùng") ||
        name.includes("siêu thị") ||
        name.includes("market")
      ) {
        return "🛒";
      }

      // Y tế
      if (
        name.includes("y tế") ||
        name.includes("health") ||
        name.includes("bệnh viện") ||
        name.includes("hospital") ||
        name.includes("thuốc") ||
        name.includes("medicine") ||
        name.includes("bác sĩ") ||
        name.includes("doctor") ||
        name.includes("khám") ||
        name.includes("chữa") ||
        name.includes("điều trị")
      ) {
        return "🏥";
      }

      // Giải trí
      if (
        name.includes("giải trí") ||
        name.includes("entertainment") ||
        name.includes("phim") ||
        name.includes("movie") ||
        name.includes("cinema") ||
        name.includes("game") ||
        name.includes("du lịch") ||
        name.includes("travel") ||
        name.includes("vacation") ||
        name.includes("holiday") ||
        name.includes("nghỉ") ||
        name.includes("vui chơi") ||
        name.includes("party") ||
        name.includes("bar") ||
        name.includes("club")
      ) {
        return "🎬";
      }

      // Giáo dục
      if (
        name.includes("học") ||
        name.includes("education") ||
        name.includes("study") ||
        name.includes("sách") ||
        name.includes("book") ||
        name.includes("khóa học") ||
        name.includes("course") ||
        name.includes("training") ||
        name.includes("đào tạo") ||
        name.includes("học phí") ||
        name.includes("tuition")
      ) {
        return "📚";
      }

      // Nhà cửa
      if (
        name.includes("nhà") ||
        name.includes("house") ||
        name.includes("rent") ||
        name.includes("thuê") ||
        name.includes("điện") ||
        name.includes("nước") ||
        name.includes("internet") ||
        name.includes("wifi") ||
        name.includes("gas") ||
        name.includes("utilities") ||
        name.includes("hóa đơn") ||
        name.includes("bill")
      ) {
        return "🏠";
      }

      // Làm đẹp
      if (
        name.includes("làm đẹp") ||
        name.includes("beauty") ||
        name.includes("spa") ||
        name.includes("salon") ||
        name.includes("cắt tóc") ||
        name.includes("haircut") ||
        name.includes("nail") ||
        name.includes("massage") ||
        name.includes("skincare") ||
        name.includes("cosmetic")
      ) {
        return "💄";
      }

      // Thể thao
      if (
        name.includes("thể thao") ||
        name.includes("sport") ||
        name.includes("gym") ||
        name.includes("fitness") ||
        name.includes("yoga") ||
        name.includes("bơi") ||
        name.includes("chạy") ||
        name.includes("tennis") ||
        name.includes("football") ||
        name.includes("bóng")
      ) {
        return "⚽";
      }

      // Quà tặng
      if (
        name.includes("quà") ||
        name.includes("gift") ||
        name.includes("tặng") ||
        name.includes("present") ||
        name.includes("sinh nhật") ||
        name.includes("birthday") ||
        name.includes("anniversary") ||
        name.includes("kỷ niệm")
      ) {
        return "🎁";
      }

      // Default cho chi tiêu
      return "💸";
    }

    // Icons cho thu nhập (THUNHAP)
    if (type === "THUNHAP") {
      // Lương
      if (
        name.includes("lương") ||
        name.includes("salary") ||
        name.includes("wage") ||
        name.includes("công") ||
        name.includes("work") ||
        name.includes("job") ||
        name.includes("employ")
      ) {
        return "💼";
      }

      // Đầu tư
      if (
        name.includes("đầu tư") ||
        name.includes("investment") ||
        name.includes("stock") ||
        name.includes("bond") ||
        name.includes("fund") ||
        name.includes("crypto") ||
        name.includes("bitcoin") ||
        name.includes("chứng khoán") ||
        name.includes("cổ phiếu")
      ) {
        return "📈";
      }

      // Kinh doanh
      if (
        name.includes("kinh doanh") ||
        name.includes("business") ||
        name.includes("bán") ||
        name.includes("sell") ||
        name.includes("doanh thu") ||
        name.includes("revenue") ||
        name.includes("profit") ||
        name.includes("lãi")
      ) {
        return "💰";
      }

      // Quà tặng nhận được
      if (
        name.includes("quà") ||
        name.includes("gift") ||
        name.includes("tặng") ||
        name.includes("thưởng") ||
        name.includes("bonus") ||
        name.includes("award")
      ) {
        return "🎉";
      }

      // Bán đồ
      if (
        name.includes("bán") ||
        name.includes("thanh lý") ||
        name.includes("second hand") ||
        name.includes("cũ")
      ) {
        return "🏷️";
      }

      // Default cho thu nhập
      return "💰";
    }

    // Default chung
    return "❓";
  }

  // Tạo category thực tế trong database (được gọi từ routes)
  async createCategoryInDB(categoryData) {
    try {
      console.log("=== CREATING CATEGORY IN DATABASE ===");
      console.log("Category data:", categoryData);

      const newCategory = new Category(categoryData);
      const savedCategory = await newCategory.save();

      console.log("✅ Category saved successfully:", savedCategory);
      return savedCategory;
    } catch (error) {
      console.error("❌ Error creating category in DB:", error);
      throw error;
    }
  }
}

module.exports = CategoryHandler;

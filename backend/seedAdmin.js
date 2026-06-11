const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Import User model
const User = require("./models/User");

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB connected");

    // Check if admin1 already exists
    const existingAdmin = await User.findOne({ username: "admin1" });
    
    if (existingAdmin) {
      console.log("⚠️ Tài khoản admin1 đã tồn tại!");
      console.log("Thông tin tài khoản:");
      console.log("- Username:", existingAdmin.username);
      console.log("- Fullname:", existingAdmin.fullname);
      console.log("- Role:", existingAdmin.role);
      console.log("- Email:", existingAdmin.email || "Chưa có email");
      
      // Update role to admin if it's not already
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log(" Đã cập nhật role thành admin");
      }
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash("admin123", 10);

      // Create new admin user
      const adminUser = new User({
        username: "admin1",
        fullname: "Administrator",
        password: hashedPassword,
        role: "admin",
        email: "admin@example.com", // Optional: có thể thay đổi
      });

      await adminUser.save();
      console.log(" Tạo tài khoản admin thành công!");
      console.log("Thông tin đăng nhập:");
      console.log("- Username: admin1");
      console.log("- Password: admin123");
      console.log("- Role: admin");
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("✅ Đã ngắt kết nối MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

// Run the function
createAdminUser();

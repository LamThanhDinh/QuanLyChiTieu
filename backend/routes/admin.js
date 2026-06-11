const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const adminController = require("../controllers/adminController");

// Tất cả routes này đều cần quyền admin
router.use(verifyAdmin);

// Thống kê dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// Quản lý users
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.post("/users/:id/reset-password", adminController.resetUserPassword);

module.exports = router;

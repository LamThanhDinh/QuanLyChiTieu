/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Quản lý tài khoản ngân hàng
 *
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       required:
 *         - name
 *         - balance
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Vietcombank
 *         balance:
 *           type: number
 *           example: 1000000
 *         bankName:
 *           type: string
 *           example: Vietcombank
 *         accountNumber:
 *           type: string
 *           example: 1234567890
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// backend/routes/accounts.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

// 1. Import controller mới
const accountController = require("../controllers/accountController");

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Lấy tất cả tài khoản của người dùng
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tài khoản
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *
 *   post:
 *     summary: Tạo tài khoản mới
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - balance
 *             properties:
 *               name:
 *                 type: string
 *               balance:
 *                 type: number
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tài khoản được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 */

// 2. Sử dụng các hàm từ controller
router.get("/", verifyToken, accountController.getAccounts);
router.post("/", verifyToken, accountController.createAccount);
/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Cập nhật tài khoản
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của tài khoản
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               balance:
 *                 type: number
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Không tìm thấy tài khoản
 *
 *   delete:
 *     summary: Xóa tài khoản
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của tài khoản
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Xóa tài khoản thành công
 *       404:
 *         description: Không tìm thấy tài khoản
 */

/**
 * @swagger
 * /api/accounts/all:
 *   delete:
 *     summary: Xóa tất cả tài khoản của người dùng
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đã xóa toàn bộ tài khoản!
 *                 deletedCount:
 *                   type: number
 *       500:
 *         description: Lỗi server
 */

router.put("/:id", verifyToken, accountController.updateAccount);

// Đặt route này TRƯỚC route delete theo id để tránh nhầm lẫn
router.delete("/all", verifyToken, async (req, res) => {
  try {
    console.log("DELETE /accounts/all - req.user:", req.user);
    const result = await require("../models/Account").deleteMany({
      userId: req.user.id,
    });
    console.log("Kết quả deleteMany:", result);
    res.json({
      message: "Đã xóa toàn bộ tài khoản!",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Lỗi xóa toàn bộ tài khoản:", err);
    res
      .status(500)
      .json({
        message: "Lỗi xóa tài khoản",
        error: err.message,
        stack: err.stack,
      });
  }
});

router.delete("/:id", verifyToken, accountController.deleteAccount);

module.exports = router;

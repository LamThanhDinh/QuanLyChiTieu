/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: 💸 Quản lý giao dịch thu/chi
 *
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - type
 *         - categoryId
 *         - accountId
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Mua cà phê
 *         amount:
 *           type: number
 *           example: 50000
 *         type:
 *           type: string
 *           enum: [THUNHAP, CHITIEU]
 *           example: CHITIEU
 *         categoryId:
 *           type: string
 *           description: ID của danh mục
 *         accountId:
 *           type: string
 *           description: ID của tài khoản
 *         note:
 *           type: string
 *           example: Cafe sáng ở quán quen
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00.000Z
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TransactionWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/Transaction'
 *         - type: object
 *           properties:
 *             category:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 icon:
 *                   type: string
 *             account:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 bankName:
 *                   type: string
 */

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const transactionController = require("../controllers/transactionController");

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Lấy danh sách giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng giao dịch mỗi trang
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ALL, THUNHAP, CHITIEU]
 *         description: Lọc theo loại giao dịch
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Lọc theo tài khoản
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên giao dịch
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Từ ngày
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Đến ngày
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, name]
 *           default: date
 *         description: Sắp xếp theo
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TransactionWithDetails'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalTransactions:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *
 *   post:
 *     summary: Tạo giao dịch mới
 *     tags: [Transactions]
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
 *               - amount
 *               - type
 *               - categoryId
 *               - accountId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mua cà phê
 *               amount:
 *                 type: number
 *                 example: 50000
 *               type:
 *                 type: string
 *                 enum: [THUNHAP, CHITIEU]
 *                 example: CHITIEU
 *               categoryId:
 *                 type: string
 *                 description: ID của danh mục
 *               accountId:
 *                 type: string
 *                 description: ID của tài khoản
 *               note:
 *                 type: string
 *                 example: Cafe sáng ở quán quen
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T10:30:00.000Z
 *     responses:
 *       201:
 *         description: Giao dịch được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Cập nhật giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của giao dịch
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [THUNHAP, CHITIEU]
 *               categoryId:
 *                 type: string
 *               accountId:
 *                 type: string
 *               note:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Không tìm thấy giao dịch
 *
 *   delete:
 *     summary: Xóa giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của giao dịch
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
 *                   example: Xóa giao dịch thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 */

/**
 * @swagger
 * /api/transactions/all:
 *   delete:
 *     summary: Xóa tất cả giao dịch của người dùng
 *     tags: [Transactions]
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
 *                   example: Đã xóa toàn bộ giao dịch!
 *                 deletedCount:
 *                   type: number
 *       500:
 *         description: Lỗi server
 */

router.post("/", verifyToken, transactionController.createTransaction);
router.get("/", verifyToken, transactionController.getAllTransactions);
router.delete("/all", verifyToken, async (req, res) => {
  try {
    const result = await require("../models/Transaction").deleteMany({
      userId: req.user.id,
      $or: [{ familyId: null }, { familyId: { $exists: false } }],
    });
    res.json({
      message: "Đã xóa toàn bộ giao dịch!",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa giao dịch", error: err.message });
  }
});

router.delete("/:id", verifyToken, transactionController.deleteTransaction);
router.put("/:id", verifyToken, transactionController.updateTransaction);

module.exports = router;

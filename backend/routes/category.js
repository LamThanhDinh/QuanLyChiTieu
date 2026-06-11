/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: 📂 Quản lý danh mục thu/chi
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Ăn uống
 *         type:
 *           type: string
 *           enum: [THUNHAP, CHITIEU]
 *           example: CHITIEU
 *         icon:
 *           type: string
 *           example: fa-utensils
 *         userId:
 *           type: string
 *         isGoalCategory:
 *           type: boolean
 *           default: false
 *           description: Đánh dấu có phải là danh mục của mục tiêu hay không
 *         goalId:
 *           type: string
 *           description: ID của mục tiêu (nếu là goal category)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         totalAmount:
 *           type: number
 *           description: Tổng số tiền của các giao dịch thuộc danh mục
 *     CategoryWithStats:
 *       allOf:
 *         - $ref: '#/components/schemas/Category'
 *         - type: object
 *           properties:
 *             transactionCount:
 *               type: number
 *               description: Số lượng giao dịch trong danh mục
 *             averageAmount:
 *               type: number
 *               description: Số tiền trung bình mỗi giao dịch
 *             lastTransactionDate:
 *               type: string
 *               format: date-time
 *               description: Ngày giao dịch cuối cùng
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy tất cả danh mục của người dùng (kèm tổng số tiền)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, month, year, custom]
 *         description: Khoảng thời gian tính tổng số tiền
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm (khi period = year hoặc month)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Tháng (khi period = month)
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày (khi period = day)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (khi period = custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (khi period = custom)
 *     responses:
 *       200:
 *         description: Danh sách danh mục với thống kê
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryWithStats'
 *       500:
 *         description: Lỗi server
 *
 *   post:
 *     summary: Tạo danh mục mới
 *     tags: [Categories]
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
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ăn uống
 *               type:
 *                 type: string
 *                 enum: [THUNHAP, CHITIEU]
 *                 example: CHITIEU
 *               icon:
 *                 type: string
 *                 example: fa-utensils
 *     responses:
 *       201:
 *         description: Danh mục được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Thiếu tên hoặc loại danh mục
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/categories/all:
 *   delete:
 *     summary: Xóa tất cả danh mục của người dùng
 *     tags: [Categories]
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
 *                   example: Đã xóa toàn bộ danh mục!
 *                 deletedCount:
 *                   type: number
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Cập nhật danh mục
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của danh mục
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [THUNHAP, CHITIEU]
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Không tìm thấy danh mục
 *
 *   delete:
 *     summary: Xoá danh mục
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của danh mục
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
 *                   example: Xóa danh mục thành công
 *       404:
 *         description: Không tìm thấy danh mục
 */

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.get("/", verifyToken, getCategories);
router.post("/", verifyToken, createCategory);
router.put("/:id", verifyToken, updateCategory);

router.delete(
  "/all",
  require("../middleware/verifyToken"),
  async (req, res) => {
    try {
      const result = await require("../models/Category").deleteMany({
        userId: req.user.id,
      });
      res.json({
        message: "Đã xóa toàn bộ danh mục!",
        deletedCount: result.deletedCount,
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi xóa danh mục", error: err.message });
    }
  }
);

router.delete("/:id", verifyToken, deleteCategory);

module.exports = router;

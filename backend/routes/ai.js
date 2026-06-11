/**
 * @swagger
 * tags:
 *   name: AI Assistant
 *   description: Trợ lý AI thông minh
 *
 * components:
 *   schemas:
 *     AIMessage:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           example: "Tôi muốn thêm giao dịch mua cafe 50000"
 *     AIResponse:
 *       type: object
 *       properties:
 *         response:
 *           type: string
 *           description: Phản hồi từ AI
 *         action:
 *           type: string
 *           enum: [CHAT_RESPONSE, CREATE_TRANSACTION, CREATE_CATEGORY, CREATE_ACCOUNT, CREATE_GOAL]
 *           description: Hành động được đề xuất
 *         data:
 *           type: object
 *           description: Dữ liệu đi kèm (nếu có)
 *     TransactionCreate:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - type
 *         - categoryId
 *         - accountId
 *       properties:
 *         name:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum: [THUNHAP, CHITIEU]
 *         categoryId:
 *           type: string
 *         accountId:
 *           type: string
 *         note:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *     CategoryCreate:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [THUNHAP, CHITIEU]
 *         icon:
 *           type: string
 *     AccountCreate:
 *       type: object
 *       required:
 *         - name
 *         - balance
 *       properties:
 *         name:
 *           type: string
 *         balance:
 *           type: number
 *         bankName:
 *           type: string
 *         accountNumber:
 *           type: string
 *     GoalCreate:
 *       type: object
 *       required:
 *         - name
 *         - targetAmount
 *       properties:
 *         name:
 *           type: string
 *         targetAmount:
 *           type: number
 *         deadline:
 *           type: string
 *           format: date
 *         icon:
 *           type: string
 */

/**
 * @swagger
 * /api/ai-assistant:
 *   post:
 *     summary: Gửi tin nhắn đến AI Assistant
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIMessage'
 *     responses:
 *       200:
 *         description: Phản hồi từ AI
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIResponse'
 *       400:
 *         description: Thiếu tin nhắn
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/ai-assistant/create-transaction:
 *   post:
 *     summary: Tạo giao dịch từ AI suggestion
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionCreate'
 *     responses:
 *       201:
 *         description: Giao dịch được tạo thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/ai-assistant/create-category:
 *   post:
 *     summary: Tạo danh mục từ AI suggestion
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *     responses:
 *       201:
 *         description: Danh mục được tạo thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/ai-assistant/create-account:
 *   post:
 *     summary: Tạo tài khoản từ AI suggestion
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountCreate'
 *     responses:
 *       201:
 *         description: Tài khoản được tạo thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/ai-assistant/create-goal:
 *   post:
 *     summary: Tạo mục tiêu từ AI suggestion
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoalCreate'
 *     responses:
 *       201:
 *         description: Mục tiêu được tạo thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       500:
 *         description: Lỗi server
 */

// backend/routes/ai.js
const express = require("express");
const router = express.Router();
const AIController = require("../controllers/aiController");
const verifyToken = require("../middleware/verifyToken");
const uploadInvoice = require("../middleware/uploadInvoice");

// Khởi tạo instance của AIController
const aiController = new AIController();

// Route xử lý tin nhắn AI - Frontend gọi POST /api/ai-assistant
router.post("/", verifyToken, aiController.processMessage.bind(aiController));

// Route để upload ảnh/PDF hóa đơn và tự động tách khoản thu/chi
router.post(
  "/analyze-invoice",
  verifyToken,
  uploadInvoice.single("file"),
  aiController.processInvoiceUpload.bind(aiController)
);

// Route để tạo giao dịch sau khi AI đã phân tích và người dùng xác nhận
router.post(
  "/create-transaction",
  verifyToken,
  aiController.createTransaction.bind(aiController)
);

// Route để tạo danh mục sau khi AI đã phân tích và người dùng xác nhận
router.post(
  "/create-category",
  verifyToken,
  aiController.createCategory.bind(aiController)
);

// Route để tạo tài khoản sau khi AI đã phân tích và người dùng xác nhận
router.post(
  "/create-account",
  verifyToken,
  aiController.createAccount.bind(aiController)
);

// Route để tạo mục tiêu sau khi AI đã phân tích và người dùng xác nhận
router.post(
  "/create-goal",
  verifyToken,
  aiController.createGoal.bind(aiController)
);

module.exports = router;

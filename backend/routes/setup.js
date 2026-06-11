// backend/routes/setup.js
const express = require("express");
const router = express.Router();
const {
  createDefaultData,
  checkUserDataStatus,
} = require("../controllers/setupController");
const verifyToken = require("../middleware/verifyToken");

/**
 * @swagger
 * /api/setup/default-data:
 *   post:
 *     summary: Tạo dữ liệu mặc định cho người dùng mới
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tạo dữ liệu mặc định thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: number
 *                     accounts:
 *                       type: number
 *       400:
 *         description: Người dùng đã có dữ liệu
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lỗi server
 */
router.post("/default-data", verifyToken, createDefaultData);

/**
 * @swagger
 * /api/setup/status:
 *   get:
 *     summary: Kiểm tra trạng thái dữ liệu của người dùng
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin trạng thái dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasCategories:
 *                   type: boolean
 *                 hasAccounts:
 *                   type: boolean
 *                 hasMinimumData:
 *                   type: boolean
 *                 counts:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: number
 *                     accounts:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lỗi server
 */
router.get("/status", verifyToken, checkUserDataStatus);

module.exports = router;

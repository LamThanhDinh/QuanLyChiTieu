/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Thống kê và báo cáo
 *
 * components:
 *   schemas:
 *     OverviewStats:
 *       type: object
 *       properties:
 *         totalIncome:
 *           type: number
 *           description: Tổng thu nhập
 *         totalExpense:
 *           type: number
 *           description: Tổng chi tiêu
 *         balance:
 *           type: number
 *           description: Số dư
 *         transactionCount:
 *           type: number
 *           description: Số lượng giao dịch
 *     CategoryStats:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         categoryName:
 *           type: string
 *         totalAmount:
 *           type: number
 *         transactionCount:
 *           type: number
 *         percentage:
 *           type: number
 */

/**
 * @swagger
 * /api/statistics/overview:
 *   get:
 *     summary: Lấy thống kê tổng quan
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, month, year, custom]
 *         description: Khoảng thời gian thống kê
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm (khi period = year)
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
 *         description: Thống kê tổng quan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OverviewStats'
 */

/**
 * @swagger
 * /api/statistics/trend:
 *   get:
 *     summary: Lấy xu hướng thu chi theo thời gian
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, year]
 *         description: Khoảng thời gian
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Tháng
 *     responses:
 *       200:
 *         description: Dữ liệu xu hướng thu chi
 */

/**
 * @swagger
 * /api/statistics/by-category:
 *   get:
 *     summary: Thống kê theo danh mục
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [THUNHAP, CHITIEU]
 *         description: Loại giao dịch
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, month, year, custom]
 *         description: Khoảng thời gian
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Tháng
 *     responses:
 *       200:
 *         description: Thống kê theo danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryStats'
 */

/**
 * @swagger
 * /api/statistics/calendar:
 *   get:
 *     summary: Lấy dữ liệu giao dịch cho lịch tháng
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: Năm
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         required: true
 *         description: Tháng
 *     responses:
 *       200:
 *         description: Dữ liệu giao dịch theo ngày trong tháng
 */

/**
 * @swagger
 * /api/statistics/summary:
 *   get:
 *     summary: Lấy báo cáo tổng hợp
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, year]
 *         description: Khoảng thời gian
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Tháng
 *     responses:
 *       200:
 *         description: Báo cáo tổng hợp
 */

const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");
const verifyToken = require("../middleware/verifyToken");

router.get("/overview", verifyToken, statisticsController.getOverviewStats);
router.get("/trend", verifyToken, statisticsController.getIncomeExpenseTrend);
router.get(
  "/by-category",
  verifyToken,
  statisticsController.getStatsByCategory
);
router.get(
  "/calendar",
  verifyToken,
  statisticsController.getMonthlyTransactionsForCalendar
);
router.get("/summary", verifyToken, statisticsController.getSummaryStats);

module.exports = router;

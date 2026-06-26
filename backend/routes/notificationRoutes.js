const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const notificationController = require("../controllers/notificationController");

router.get("/", verifyToken, notificationController.getNotifications);
router.patch("/:id/read", verifyToken, notificationController.markAsRead);

module.exports = router;

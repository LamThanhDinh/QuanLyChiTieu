const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const familyController = require("../controllers/familyController");

router.post("/:id/accept", verifyToken, familyController.acceptInvitation);
router.post("/:id/reject", verifyToken, familyController.rejectInvitation);

module.exports = router;

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const familyController = require("../controllers/familyController");

router.post("/", verifyToken, familyController.createFamily);
router.get("/", verifyToken, familyController.getFamilies);
router.get("/:id", verifyToken, familyController.getFamilyDetail);
router.delete("/:id", verifyToken, familyController.deleteFamily);
router.post("/:id/invite", verifyToken, familyController.inviteMember);
router.delete("/:id/members/:memberId", verifyToken, familyController.removeMember);
router.post("/:id/leave", verifyToken, familyController.leaveFamily);
router.post("/:id/transfer-ownership", verifyToken, familyController.transferOwnership);
router.get("/:id/transactions", verifyToken, familyController.getFamilyTransactions);
router.post("/:id/transactions", verifyToken, familyController.createFamilyTransaction);
router.put("/:id/transactions/:transactionId", verifyToken, familyController.updateFamilyTransaction);
router.delete("/:id/transactions/:transactionId", verifyToken, familyController.deleteFamilyTransaction);

module.exports = router;

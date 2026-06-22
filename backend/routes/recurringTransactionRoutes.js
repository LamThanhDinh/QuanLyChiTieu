const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  runRecurringTransaction,
  getGeneratedTransactions,
  processDueRecurringTransactions,
} = require("../controllers/recurringTransactionController");

router.get("/", verifyToken, getRecurringTransactions);
router.post("/", verifyToken, createRecurringTransaction);
router.post("/process-due", verifyToken, processDueRecurringTransactions);
router.post("/:id/run", verifyToken, runRecurringTransaction);
router.get("/:id/generated-transactions", verifyToken, getGeneratedTransactions);
router.put("/:id", verifyToken, updateRecurringTransaction);
router.delete("/:id", verifyToken, deleteRecurringTransaction);

module.exports = router;

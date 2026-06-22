const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getBudgets,
  upsertBudget,
  updateBudget,
  deleteBudget,
  suggestBudgets,
  applyBudgetSuggestions,
} = require("../controllers/budgetController");

router.get("/", verifyToken, getBudgets);
router.post("/", verifyToken, upsertBudget);
router.get("/suggestions", verifyToken, suggestBudgets);
router.post("/apply-suggestions", verifyToken, applyBudgetSuggestions);
router.put("/:id", verifyToken, updateBudget);
router.delete("/:id", verifyToken, deleteBudget);

module.exports = router;

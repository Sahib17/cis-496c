import express from "express";
import { 
  postExpense, 
  getExpenses, 
  getExpenseById, 
  patchExpense, 
  deleteExpense, 
  postComment 
} from "../controllers/expense.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/', isLoggedIn, postExpense);
router.get('/', isLoggedIn, getExpenses);
router.get('/:expenseId', isLoggedIn, getExpenseById);
router.patch('/:expenseId', isLoggedIn, patchExpense);
router.delete('/:expenseId', isLoggedIn, deleteExpense);
router.post('/:expenseId/comments', isLoggedIn, postComment);

export default router;
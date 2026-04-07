// POST   /expenses
// GET    /expenses
// GET    /expenses/:expenseId
// PUT    /expenses/:expenseId
// DELETE /expenses/:expenseId
// POST   /expenses/:expenseId/comments

import express from "express";
import { postExpense } from "../controllers/expense.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post('/', isLoggedIn, postExpense);

export default router;

function aFunction(){

}
// POST     /expenses
// GET      /expenses
// GET      /expenses/:expenseId
// PATCH    /expenses/:expenseId
// DELETE   /expenses/:expenseId
// POST     /expenses/:expenseId/comments

import { expenseService } from "../services/expense.service.js";
import { expenseValidator } from "../validators/expense.validator.js";

export const postExpense = async (req, res) => {
  try {
    const result = expenseValidator.postExpense.safeParse(req.body);
    console.log(req.user);
    
    if (!result.success) {
      return res
        .status(400)
        .json({ errors: result.error.flatten().fieldErrors });
    }
    const validatedData = result.data;
    const expense = expenseService.calculateSplit(validatedData.paidBy, validatedData.members, validatedData.options)
    const expensed = await expenseService.postExpense(req.user.userId, req.body, expense.withBalance);

console.log("expense: ", expense);
return res.status(200).json({success: true, expense})












    // const expense = await expenseService.postExpense(req.user.userId);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
  const user = req.user.userId;
  const group = req.body.groupId;
  const expense = req.params.expenseId;
  const result = await expenseService.deleteExpense(user, group, expense);
  res.status(200).json({success: true, message: "expense deleted", data: result})
  } catch (error) {
    res.status(500 || error.statusCode).send(error.message || "Server error");
  }
  
}


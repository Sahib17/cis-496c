import { expenseService } from "../services/expense.service.js";
import { expenseValidator } from "../validators/expense.validator.js";

export const postExpense = async (req, res) => {
  try {
    const result = expenseValidator.postExpense.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }
    const validatedData = result.data;
    const splitData = expenseService.calculateSplit(validatedData.paidBy, validatedData.members, validatedData.options);
    const expense = await expenseService.postExpense(req.user.userId, req.body, splitData.withBalance);

    return res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await expenseService.getExpenses(req.user.userId);
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await expenseService.getExpense(req.user.userId, req.params.expenseId);
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const patchExpense = async (req, res) => {
  try {
    const expense = await expenseService.patchExpense(req.user.userId, req.params.expenseId, req.body);
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await expenseService.deleteExpense(req.user.userId, req.params.expenseId);
    res.status(200).json({ success: true, message: "Expense deleted" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const postComment = async (req, res) => {
  try {
    const comment = await expenseService.postComment(req.user.userId, req.params.expenseId, req.body);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
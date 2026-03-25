// POST   /expenses
// GET    /expenses
// GET    /expenses/:expenseId
// PUT    /expenses/:expenseId
// DELETE /expenses/:expenseId
// POST   /expenses/:expenseId/comments

import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import { calculateSplit } from "../utils/expenseUtils.js";

const postExpense = async (userId, body, members) => {
  const result = await Expense.create({
    name: body.name,
    groupId: body.groupId,
    createdBy: userId,
    paidBy: body.paidBy,
    members: members,
    status: "ACTIVE",
    options: body.options,
  });
  return result;
};

const getExpense = async (userId, expenseId) => {
  const expense = await Expense.findById(expenseId)
    .populate("paidBy.user", "name email")
    .populate("members.user", "name email")
    .populate("createdBy", "name email");

  if (!expense) {
    const error = new Error("Expense not found");
    error.statusCode = 404;
    throw error;
  }
  const member = await GroupMember.findOne({
    groupId: expense.groupId,
    memberId: userId,
    status: "JOINED",
  });
  if (!member) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
  return expense;
};

const patchExpense = async (req, res) => {};

const deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    const error = new Error("Expense not found");
    error.statusCode = 404;
    throw error;
  }
  const member = await GroupMember.findOne({
    groupId: expense.groupId,
    memberId: userId,
    status: "JOINED",
  });
  if (!member) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
  if (expense.status === "INACTIVE") {
    const error = new Error("Expense already deleted");
    error.statusCode = 400;
    throw error;
  }
  const updatedExpense = await Expense.findByIdAndUpdate(expenseId, {
    status: "INACTIVE",
  });
  return updatedExpense;
};

const postComment = async (req, res) => {};

export const expenseService = {
  postExpense,
  getExpense,
  patchExpense,
  deleteExpense,
  postComment,
  calculateSplit,  // re-export from utils
};
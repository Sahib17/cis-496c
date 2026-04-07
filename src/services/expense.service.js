// POST   /expenses
// GET    /expenses
// GET    /expenses/:expenseId
// PUT    /expenses/:expenseId
// DELETE /expenses/:expenseId
// POST   /expenses/:expenseId/comments

import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import {
  attachBalances,
  attachPayments,
  distributeRemainder,
  settlement,
} from "../utils/expenseUtils.js";


const postExpense = async (userId, body, members, paidBy) => {
  
  const result = await Expense.create({
    name: body.name,
    groupId: body.groupId,
    createdBy: userId,
    paidBy: paidBy.paidBy,
    members: members,
    status: "ACTIVE",
    options: body.options,
  })
  return result
};



const getExpense = async (userId) => {
  try {
    const expense = await Expense.findById(expenseId);
    if (!expense){
      const error = new Error("Expense not found");
      error.statusCode = 404;
      throw error;
    };
    const member = await GroupMember.findOne({groupId: expense.groupId, memberId: userId, status: "JOINED"});
    if(!member){
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }
    return expense;
  } catch (error) {
    throw error;
  }
};

const patchExpense = async (req, res) => {};

const deleteExpense = async (userId, expenseId) => {
  try {
    const expense = await Expense.findById(expenseId);
    if (!expense){
      const error = new Error("Expense not found");
      error.statusCode = 404;
      throw error;
    };
    const member = await GroupMember.findOne({groupId: expense.groupId, memberId: userId, status: "JOINED"});
    if(!member){
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }
    if(expense.status === "INACTIVE"){
      const error = new Error("Expense already deleted");
      error.statusCode = 400;
      throw error;
    }
    const updatedExpense = await Expense.findByIdAndUpdate(expenseId, {
      status: "INACTIVE"
    });
    return updatedExpense;
  } catch (error) {
    throw error;
  }
};

const postComment = async (req, res) => {};

const calculateSplit = (paidBy, members, options) => {
  switch (options) {
    case "EQUALLY":
      return equalSplit(paidBy, members);

    case "UNEQUALLY":
      return unequalSplit(paidBy, members);

    case "PERCENTAGE":
      return percentageSplit(paidBy, members);

    case "SHARES":
      return sharesSplit(paidBy, members);

    case "ADJUSTMENT":
      return adjustmentSplit(paidBy, members);

    default:
      throw new Error("Invalid split option");
  }
};

const equalSplit = (paidBy, members) => {
  // BASIC LOGIC
  const count = members.length; // count, totalAmount => baseAmount, remainder => membersWithBase => membersWithOwed, membersWithPaid => membersWithBalance => creditors, debitors, => settlements
  const totalAmount = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);

  const baseAmount = Math.floor(totalAmount / count);
  let remainder = totalAmount % count;
  const membersWithBase = members.map((m) => ({
    ...m,
    amountOwed: baseAmount,
  }));

  // common from here
  const withOwed = distributeRemainder(remainder, membersWithBase);
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  // settlements function
  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    creditors,
    debtors,
    withBalance,
  };
};

const unequalSplit = (paidBy, members) => {
  const totalAmountPaid = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);
  const totalAmountOwed = members.reduce((sum, e) => {
    return sum + e.amountOwed;
  }, 0);
  if (totalAmountPaid !== totalAmountOwed) {
    const error = new Error("paid and owed should be same");
    error.statusCode = 400;
    throw error;
  }
  const withOwed = members.map((m) => ({
    ...m,
  }));
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    withBalance,
    withOwed,
  };
};

const percentageSplit = (paidBy, members) => {
  const totalPercentage = members.reduce((sum, e) => {
    return sum + e.weight;
  }, 0);
  if (totalPercentage !== 100) {
    const error = new Error("sum of percentages should be 100");
    error.statusCode = 400;
    throw error;
  }
  const totalAmount = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);
  const withAmounts = members.map((m) => ({
    ...m,
    amountOwed: Math.floor((totalAmount * m.weight) / 100),
  }));
  const remainder =
    totalAmount - withAmounts.reduce((s, m) => s + m.amountOwed, 0);

  const withOwed = distributeRemainder(remainder, withAmounts);
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  // settlements function
  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    creditors,
    debtors,
    withBalance,
  };
};

const sharesSplit = (paidBy, members) => {
  const totalAmount = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);
  const totalShares = members.reduce((sum, e) => {
    return sum + e.weight;
  }, 0);
  if (totalShares <= 1) {
    const error = new Error("atleast 1 share needed");
    error.statusCode = 400;
    throw error;
  }
  const baseAmount = totalAmount / totalShares;
  const withAmounts = members.map((m) => ({
    ...m,
    amountOwed: Math.floor(baseAmount * m.weight),
  }));
  const remainder =
    totalAmount -
    withAmounts.reduce((sum, e) => {
      return sum + e.amountOwed;
    }, 0);

  const withOwed = distributeRemainder(remainder, withAmounts);
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  // settlements function
  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    creditors,
    debtors,
    withBalance,
  };
};

const adjustmentSplit = (paidBy, members) => {
  const totalAmount = paidBy.reduce((sum, e) => {
    return sum + e.amount;
  }, 0);
  const count = members.length;
  const totalWeight = members.reduce((sum, e) => {
    return sum + e.weight;
  }, 0)
  if (totalWeight >= totalAmount) {
    const error = new Error("Weight cannot be bigger than totalAmount");
    error.statusCode = 400;
    throw error;
  }
  const baseAmount = Math.floor((totalAmount - totalWeight) / count);

  const withAmounts = members.map((m) => ({
    ...m,
    amountOwed: baseAmount + m.weight,
  }))
  const remainder = totalAmount - withAmounts.reduce((sum, e) => {
    return sum + e.amountOwed;
  }, 0);
  const withOwed = distributeRemainder(remainder, withAmounts);
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);

  // settlements function
  const settlements = settlement(creditors, debtors);

  return {
    settlements,
    creditors,
    debtors,
    withBalance,
  };
};

const Gsettlement = async (groupId, userId) => {
  const expenses = await Expense.find({groupId, status: "ACTIVE"});
  const withPaid = attachPayments(withOwed, paidBy);
  const withBalance = attachBalances(withPaid);
  const creditors = withBalance.filter((m) => m.balance > 0);
  const debtors = withBalance.filter((m) => m.balance < 0);
}

export const expenseService = {
  postExpense,
  // getExpenses,
  getExpense,
  patchExpense,
  deleteExpense,
  postComment,
  calculateSplit,
  Gsettlement,
};


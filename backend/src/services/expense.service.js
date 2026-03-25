// POST   /expenses
// GET    /expenses
// GET    /expenses/:expenseId
// PUT    /expenses/:expenseId
// DELETE /expenses/:expenseId
// POST   /expenses/:expenseId/comments

import Expense from "../models/Expense.js";
import GroupMember from "../models/GroupMember.js";
import Comment from "../models/Comment.js";
import { attachBalances, attachPayments, distributeRemainder, settlement } from "../utils/expenseUtils.js";

const postExpense = async (userId, body, members) => {
  return await Expense.create({
    name: body.name,
    groupId: body.groupId,
    createdBy: userId,
    paidBy: body.paidBy,
    members: members,
    status: "ACTIVE",
    options: body.options,
  });
};

const getExpenses = async (userId) => {
  const userGroups = await GroupMember.find({ memberId: userId, status: "JOINED" }).distinct("groupId");
  return await Expense.find({ groupId: { $in: userGroups }, status: "ACTIVE" }).populate("createdBy", "name email");
};


const getExpense = async (userId, expenseId) => {
  const expense = await Expense.findById(expenseId)
    .populate("paidBy.user", "name email")
    .populate("members.user", "name email")
    .populate("createdBy", "name email");
  if (!expense) throw { statusCode: 404, message: "Expense not found" };

  const member = await GroupMember.findOne({ groupId: expense.groupId, memberId: userId, status: "JOINED" });
  if (!member) throw { statusCode: 401, message: "Unauthorized" };

  return expense;
};

const patchExpense = async (userId, expenseId, data) => {
  const expense = await getExpense(userId, expenseId);
  return await Expense.findByIdAndUpdate(expenseId, { ...data }, { new: true });
};

const postComment = async (userId, expenseId, body) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw { statusCode: 404, message: "Expense not found" };

  return await Comment.create({
    expenseId,
    groupId: expense.groupId,
    sender: userId,
    message: body.message
  });
};

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

const Gsettlement = async (groupId) => {
  const expenses = await Expense.find({ groupId, status: "ACTIVE" }).lean();
  const balances = {};

  expenses.forEach(exp => {
    exp.members.forEach(m => {
      balances[m.user] = (balances[m.user] || 0) + (m.amountPaid - m.amountOwed);
    });
  });

  const creditors = Object.entries(balances).filter(([_, bal]) => bal > 0).map(([user, balance]) => ({ user, balance }));
  const debtors = Object.entries(balances).filter(([_, bal]) => bal < 0).map(([user, balance]) => ({ user, balance }));

  return settlement(creditors, debtors);
};

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

export const expenseService = {
  postExpense,
  getExpenses,
  getExpense,
  patchExpense,
  deleteExpense,
  postComment,
  calculateSplit,
  Gsettlement,
};

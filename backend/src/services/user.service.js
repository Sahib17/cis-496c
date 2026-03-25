import User from "../models/User.js";
import GroupMember from "../models/GroupMember.js";
import Expense from "../models/Expense.js";

const getUserById = async (requesterId, targetId) => {
  try {
    const user = await User.findOne({
      _id: targetId,
      blocklist: { $ne: requesterId },
    }).select("-password");
    return user;
  } catch (err) {
    if (err.status === 404) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    throw err;
  }
};

const getUserBalanceSummary = async (userId) => {
  // Find all groups the user is a part of
  const userGroups = await GroupMember.find({ memberId: userId, status: "JOINED" }).distinct("groupId");

  // Find all active expenses in those groups
  const expenses = await Expense.find({ 
    groupId: { $in: userGroups }, 
    status: "ACTIVE" 
  }).lean();

  let totalOwedToUser = 0; // Money others owe this user
  let totalUserOwes = 0;   // Money this user owes others

  expenses.forEach(expense => {
    // 1. How much did the user pay?
    const paidEntry = expense.paidBy.find(p => p.user.toString() === userId.toString());
    const amountPaid = paidEntry ? paidEntry.amount : 0;

    // 2. How much does the user owe for this expense?
    const oweEntry = expense.members.find(m => m.user.toString() === userId.toString());
    const amountOwed = oweEntry ? oweEntry.amountOwed : 0;

    const netBalance = amountPaid - amountOwed;

    if (netBalance > 0) {
      totalOwedToUser += netBalance;
    } else if (netBalance < 0) {
      totalUserOwes += Math.abs(netBalance);
    }
  });

  return { totalOwedToUser, totalUserOwes, netBalance: totalOwedToUser - totalUserOwes };
};

const getUserByMail = async (requesterId, targetMail) => {
  try {
    const user = await User.findOne({
      email: targetMail,
      blocklist: { $ne: requesterId },
    }).select("-password");
    return user;
  } catch (err) {
    if (err.status === 404) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    throw err;
  }
};

const patchUser = async (userId, data) => {
  try {
    const user = await User.findByIdAndUpdate(userId, { ...data }, { new: true, runValidators: true });
    if (!user) throw { statusCode: 404, message: "User not found" };
    return user;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userId) => {
  // Check if user has active group memberships with others
  const activeMemberships = await GroupMember.find({ memberId: userId, status: "JOINED" });
  
  // Logic: User cannot delete if they are in a group with others (simplified check)
  if (activeMemberships.length > 0) {
    throw new Error("Cannot delete user with active group memberships. Leave groups first.");
  }

  return await User.findByIdAndUpdate(userId, {
    status: "DELETED",
    name: "Deleted User",
    email: `deleted_${userId}@splitr.com`,
  }, { new: true });
};

export const userService = {
  getUserById,
  getUserByMail,
  getUserBalanceSummary,
  patchUser,
  deleteUser,
};

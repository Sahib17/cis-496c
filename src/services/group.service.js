import mongoose from "mongoose";
import { logger } from "../config/logger.js";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import GroupMember from "../models/GroupMember.js";
import Comment from "../models/Comment.js";
import { expenseService } from "./expense.service.js";

// / POST   /groups
// / GET    /groups
// / GET    /groups/:groupId
// / PUT    /groups/:groupId
// DELETE /groups/:groupId
// POST   /groups/:groupId/members
// DELETE /groups/:groupId/members/:userId

const createGroup = async (userId, body) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const memberIds = body.members;
    const count = await User.countDocuments({
      _id: { $in: memberIds },
      status: "ACTIVE",
    });
    if (count !== memberIds.length) {
      const error = new Error("Invalid members in request");
      error.statusCode = 401;
      throw error;
    }
    const [group] = await Group.create(
      [
        {
          name: body.name,
          createdBy: userId,
          type: body.type,
          image: body.image,
        },
      ],
      { session },
    );
    const members = [...new Set([userId, ...body.members])].map((memberId) => ({
      groupId: group._id,
      memberId,
      status: memberId.toString() == userId.toString() ? "JOINED" : "INVITED",
      role: memberId.toString() == userId.toString() ? "ADMIN" : "MEMBER",
    }));
    const groupMember = await GroupMember.insertMany(members, { session });
    await session.commitTransaction();
    session.endSession();
    return { group, groupMember };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(error);
    throw error;
  }
};

const getGroups = async (userId) => {
  try {
    const groups = await GroupMember.find({ memberId: userId }).populate(
      "groupId",
    );
    return groups;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getGroup = async (userId, groupId) => {
  try {
    const result = await Group.findOne({
      _id: groupId,
      "members.user": userId,
    }).lean();
    if (!result) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }
    return result;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const patchGroup = async (userId, groupId, body) => {
  try {
    const result = await Group.findOneAndUpdate(
      { _id: groupId, "members.user": userId },
      { ...body },
      { returnDocument: "after", runValidators: true },
    );
    if (!result) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const getGroupMembers = async (userId, groupId) => {
  try {
    const isMember = await GroupMember.find({groupId, memberId: userId, status: "JOINED"});
    if(!isMember.length){
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }
    const members = await GroupMember.find({groupId: groupId, status: {$in: ["JOINED", "INVITED"]}});
    if(!members){
      const error = new Error("No members found, add some");
      error.statusCode = 404;
      throw error;
    }
    return members;
  } catch (error) {
    logger.error(error);
      throw error;
  }
}

const getGroupExpenses = async (userId, groupId) => {
  try {
    // check member if he is a part of the group
    const isMember = await GroupMember.findOne({groupId, memberId: userId, status: "JOINED"});
    if(!isMember){
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    // get expenses of the group
    const expenses = await Expense.find({groupId: groupId}).populate("createdBy", "name").populate("paidBy.user", "name");
    if(expenses.length === 0){
      const error = new Error("No expenses found, add some");
      error.statusCode = 404;
      throw error;
    }

    const result = expenses.map((m) => {
  const settlements = expenses.map((m) => {
  return expenseService.calculateSplit(
    m.paidBy.map(p => p.toObject ? p.toObject() : p),
    m.members.map(mem => mem.toObject ? mem.toObject() : mem),
    m.options
  )
})

  return {
    ...m.toObject(),
    settlements
  }
})

return result

    // await session.commitTransaction();
    return expenses;
   } catch (error) {
      // await session.abortTransaction();
      logger.error(error);
      throw error;
    }
};

const deleteGroup = async (userId, groupId) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const group = await Group.findById(groupId).session(session);
    if (!group){
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }
    const member = await GroupMember.findOne({
      groupId,
      memberId: userId,
      status: "JOINED",
    }).session(session);
    if (!member) {
      const error = new Error("You are not a member of the group");
      error.statusCode = 401;
      throw error;
    }
    const count = await GroupMember.countDocuments({
      groupId,
      status: "JOINED",
    }).session(session);
    if (count > 1) {
      const error = new Error(
        "Cannot delete group as more than 1 members are there",
      );
      error.statusCode = 400;
      throw error;
    }

    await Comment.deleteMany({groupId}).session(session);
    await Expense.deleteMany({ groupId }).session(session);
    await GroupMember.deleteMany({ groupId }).session(session);
    await Group.findByIdAndDelete(groupId).session(session);
    await session.commitTransaction();

    return "Group Deleted Successfully";
  } catch (error) {
    await session.abortTransaction();

    logger.error(error);
    throw error;
  } finally {
    session.endSession();
  }
};

const postMembers = async (requesterId, groupId, body) => {
  try {
    const newMember = {
      user: requesterId,
      amountOwed: 0,
    };
    const result = await Group.findOneAndUpdate(
      {
        _id: groupId,
        "members.user": requesterId,
        "members.user": { $ne: body.userId },
      },
      {
        $push: { members: newMember },
      },
    );
    if (!result) {
      const error = new Error("Group not found");
      error.statusCode = 404;
      throw error;
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const removeMember = async (userId, groupId, targetId) => {
  try {
    const result = await Group.findOneAndUpdate({
      _id: groupId,
      "members.user": requesterId,
      "members.user": targetId,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const acceptGroupInvitation = async (userId, groupId) => {
  try {
    console.log(typeof groupId, groupId);
    console.log(userId, groupId);

    const result = await GroupMember.findOneAndUpdate(
      {
        memberId: new mongoose.Types.ObjectId(userId),
        groupId: new mongoose.Types.ObjectId(groupId),
        status: "INVITED",
      },
      {
        status: "JOINED",
      },
      { runValidators: true, returnDocument: "after" },
    );
    if (!result) {
      const error = new Error("Invitation not found or already joined");
      error.statusCode = 400;
      throw error;
    }
    console.log(result);

    return result;
  } catch (error) {
    throw error;
  }
};

const rejectGroupInvitation = async (userId, groupId) => {
  try {
    const result = await GroupMember.findOneAndDelete({
      memberId: new mongoose.Types.ObjectId(userId),
      groupId: new mongoose.Types.ObjectId(groupId),
      status: "INVITED",
    });
    if (!result) {
      const error = new Error("Invitation not found or already joined");
      error.statusCode = 400;
      throw error;
    }
    return result;
  } catch (error) {
    throw error;
  }
};

export const groupService = {
  createGroup,
  getGroups,
  getGroup,
  patchGroup,
  deleteGroup,
  postMembers,
  removeMember,
  acceptGroupInvitation,
  rejectGroupInvitation,
  getGroupExpenses,
  getGroupMembers,
};

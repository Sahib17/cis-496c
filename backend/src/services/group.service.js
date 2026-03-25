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
  const isMember = await GroupMember.findOne({ groupId, memberId: userId, status: "JOINED" });
  if (!isMember) throw { statusCode: 401, message: "Unauthorized access to group" };

  const group = await Group.findById(groupId).lean();
  if (!group) throw { statusCode: 404, message: "Group not found" };
  
  return group;
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
    if(isMember.length === 0){
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }
    const members = await GroupMember.find({groupId, status: {$in: ["JOINED","INVITED"]}})
  .populate("memberId", "name email");
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
    const isMember = await GroupMember.findOne({groupId, memberId: userId, status: "JOINED"});
    if (!isMember) {   // ← also fixes Bug 6: was isMember.length === 0 which never throws
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }
    const expenses = await Expense.find({groupId, status: "ACTIVE"})
      .populate("paidBy.user", "name email")
      .populate("members.user", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    return expenses;
  } catch (error) {
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
  // Check if requester is Admin
  const requester = await GroupMember.findOne({ groupId, memberId: requesterId, role: "ADMIN" });
  if (!requester) throw { statusCode: 401, message: "Only Admins can add members" };

  return await GroupMember.create({
    groupId,
    memberId: body.userId,
    status: "INVITED",
    role: "MEMBER"
  });
};

const removeMember = async (requesterId, groupId, targetId) => {
  const requester = await GroupMember.findOne({ groupId, memberId: requesterId, role: "ADMIN" });
  if (!requester) throw { statusCode: 401, message: "Only Admins can remove members" };

  return await GroupMember.findOneAndUpdate(
    { groupId, memberId: targetId },
    { status: "REMOVED" },
    { new: true }
  );
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

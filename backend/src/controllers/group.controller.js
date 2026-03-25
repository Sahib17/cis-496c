import { logger } from "../config/logger.js";
import { groupService } from "../services/group.service.js";
import { idValidate } from "../validators/common.validator.js";
import { groupValidator } from "../validators/group.validator.js";
import Expense from "../models/Expense.js";
import GroupMember from "../models/GroupMember.js";

// \ POST     /groups
// \ GET      /groups
// \ GET      /groups/:groupId
// \ GET      /groups/:groupId/expenses
// \ PATCH    /groups/:groupId
// \ DELETE   /groups/:groupId
// \ POST     /groups/:groupId/members
// DELETE   /groups/:groupId/members/:userId

export const createGroup = async (req, res) => {
  try {
    const error = groupValidator.createGroup(req.body);
    if (error) {
      logger.warn(error);
      res.status(400).json({
        success: false,
        error: error,
      });
    }
    console.log(req.body);

    const group = await groupService.createGroup(req.user.userId, req.body);
    logger.info("group created successfully");

    return res.status(201).json({ success: true, data: group });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create group",
    });
  }
};

export const getGroupExpenses = async (req, res) => {
  try {
    // const id = req.params.groupId;
    // const validate = idValidate.safeParse(id);
    // if (!validate.success) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: validate.error.issues[0].message });
    // }
    // console.log(validate);
    
    const data = await groupService.getGroupExpenses(req.user.userId, req.params.groupId)
    res.status(200).json({success: true, message: "Expenses found", data: data})
  } catch (error) {
    return res.status(error.statusCode || 500).json({success: false, message: error.message || "Server error"})
  }
}

export const getGroupMembers = async (req, res) => {
  try {
    // const id = req.params.groupId;
    // const validate = idValidate.safeParse(id);
    // if (!validate.success) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: validate.error.issues[0].message });
    // }
    // console.log(validate);
    
    const data = await groupService.getGroupMembers(req.user.userId, req.params.groupId)
    res.status(200).json({success: true, message: "Members found", data: data})
  } catch (error) {
    return res.status(error.statusCode || 500).json({success: false, message: error.message || "Server error"})
  }
}

export const getGroups = async (req, res) => {
  try {
    const groups = await groupService.getGroups(req.user.userId);
    res.status(200).json(groups);
  } catch (error) {}
};

export const getGroup = async (req, res) => {
  try {
    const group = await groupService.getGroup(
      req.user.userId,
      req.params.groupId,
    );
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, error: error.message });
  }
};

export const patchGroup = async (req, res) => {
  try {
    const result = groupValidator.patchGroup.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ success: false, errors: result.error.flatten().fieldErrors });
    }
    const validatedData = result.data;
    const group = await groupService.patchGroup(
      req.user.userId,
      req.params.groupId,
      validatedData,
    );
    res.status(200).json({ success: true, group });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const result = await groupService.deleteGroup(
      req.user.userId,
      req.params.groupId,
    );
    return res
      .status(200)
      .json({ success: true, message: "Group deleted successfully" });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, error: error.message });
  }
};

export const postMembers = async (req, res) => {
  try {
    const result = await groupService.postMembers(
      req.user.userId,
      req.params.groupId,
      req.body,
    );
    res.status(200).json({ success: true, result });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const result = await groupService.removeMember(
      req.user.userId,
      req.params.userId,
    );
    res.status(200).json({ success: true, result });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, error: error.message });
  }
};

export const acceptGroupInvitation = async (req, res) => {
  try {
    const result = await groupService.acceptGroupInvitation(
      req.user.userId,
      req.params.groupId,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Group join invitation accepted successfully",
        data: result,
      });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

export const rejectGroupInvitation = async (req, res) => {
  try {
    const result = await groupService.rejectGroupInvitation(
      req.user.userId,
      req.params.groupId,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Group join invitation rejected successfully",
      });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message || "Server error" });
  }
};
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all groups the user has joined
    const memberships = await GroupMember.find({ memberId: userId, status: "JOINED" });
    const groupIds = memberships.map((m) => m.groupId);

    // Fetch all active expenses in those groups, populating user refs so
    // JS-level .find() comparisons work reliably (no ObjectId vs string mismatch)
    const expenses = await Expense.find({
      groupId: { $in: groupIds },
      status: "ACTIVE",
    })
      .populate("paidBy.user", "_id")
      .populate("members.user", "_id")
      .lean();

    let totalOwed = 0; // others owe me
    let totalOwe  = 0; // I owe others

    for (const expense of expenses) {
      // Check if this user is a payer or a member
      const myMember = expense.members?.find(
        (m) => m.user?._id?.toString() === userId.toString()
      );
      const myPaidEntry = expense.paidBy?.find(
        (p) => p.user?._id?.toString() === userId.toString()
      );

      // Skip expenses that don't involve this user at all
      if (!myMember && !myPaidEntry) continue;

      const iActuallyPaid = myPaidEntry ? myPaidEntry.amount : 0;
      const iOwe          = myMember   ? myMember.amountOwed  : 0;
      const balance       = iActuallyPaid - iOwe;

      if (balance > 0) {
        totalOwed += balance; // I paid more than my share → others owe me
      } else if (balance < 0) {
        totalOwe  += -balance; // I paid less than my share → I owe others
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        youAreOwed: +totalOwed.toFixed(2),
        youOwe:     +totalOwe.toFixed(2),
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
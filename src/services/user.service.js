import User from "../models/User.js";

const getUserById = async (requesterId, targetId) => {
  try {
    const user = await User.findOne({          // ← await
      _id: targetId,
      blocklist: { $nin: [requesterId] },
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

const getUserByMail = async (requesterId, targetMail) => {
  try {
    const user = await User.findOne({          // ← await
      email: targetMail,
      blocklist: { $nin: [requesterId] },
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
    console.log(`User Id: ${userId}`);
    const user = await User.findByIdAndUpdate(
      userId,
      { ...data },
      { returnDocument: "after", runValidators: true },
    );
    console.log(user);
    return user;
  } catch (error) {
    if (error.status === 404) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const user = User.findOneAndUpdate(
      {
        _id: userId,
        owe: {
          $elemMatch: {
            amount: { $ne: 0 },
          },
        },
      },
      {
        status: "DELETED",
        deletedAt: new Date(),
        name: "Deleted User",
        email: `deleted_${userId}@deleted.com`,
      },
      { new: true },
    );

    if (!user) {
      throw new Error("Cannot delete user with outstanding balances.");
    }
  } catch (error) {
    throw error;
  }
};

export const userService = {
  getUserById,
  getUserByMail,
  patchUser,
  deleteUser,
};
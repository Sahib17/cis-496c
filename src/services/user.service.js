import User from "../models/User.js";

const getUserById = async (requesterId, targetId) => {
  try {
    const user = User.findOne({
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

const getUserByMail = async (requesterId, targetMail) => {
  try {
    const user = User.findOne({
      email: targetMail,
      blocklist: { $ne: requesterId }, // $ne = not equal
    }).select("-password"); // return everything except password
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
      {
        ...data,
      },
      { returnDocument: "after", runValidators: true },
    );
    console.log(user)
    return user;
  } catch (error) {
    if (err.status === 404) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    throw err;
  }
};

const deleteUser = async (userId) => {
  try {
    const user = User.findOneAndUpdate(
      {
        _id: userId,
        owe: {
          $elemMatch: {
            // $elemMatch finds user whose owe array contains at least one entry with amount != 0
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

import Notification from "../models/Notification";

const getNotification = async (userId) => {
  try {
    return await Notification.findOneAndUpdate({
      $or: [{ sender: userId }, { "recievers.user": userId }],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  } catch (error) {
    throw error;
  }
};

const postNotification = async (body, sender) => {
    try {
        return await Notification.create({
            ...body,
            sender,
        })
    } catch (error) {
        throw error;
    }
}

export const notificationService = {
    getNotification, postNotification
}
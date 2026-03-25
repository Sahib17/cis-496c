import { notificationService } from "../services/notification.service.js";
import { notificationValidator } from "../validators/notification.validator.js";

export const postNotification = async (req, res) => {
  try {
    const result = notificationValidator.notification.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }
    const notification = await notificationService.postNotification(
      req.body,
      req.user.userId,
    );
    return res.status(201).json({success: true, data: notification})
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

export const getNotification = async (req, res) => {
  try {
    const notifications = await notificationService.getNotification(
      req.user.userId,
    );
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

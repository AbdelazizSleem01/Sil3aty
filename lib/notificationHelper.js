import Notification from "../models/Notification";
import User from "../models/User";

/**
 * @param {string} message
 * @param {string} link
 * @param {string} type
 * @param {string} createdBy
 * @param {string} relatedUser
 */
export async function sendNotificationToAdmins(
  message,
  link = "",
  type = "system",
  createdBy,
  relatedUser = null
) {
  try {
    const admins = await User.find({ isAdmin: true }).select("_id");

    if (admins.length === 0) {
      return;
    }

    const adminIds = admins.map((admin) => admin._id);

    const notification = new Notification({
      message,
      link,
      recipients: adminIds,
      type,
      createdBy,
      relatedUser,
    });

    await notification.save();
  } catch (error) {
    throw error;
  }
}

/**
 * @param {string} message - نص الإشعار
 * @param {string} link - رابط الإشعار (اختياري)
 * @param {string} type - نوع الإشعار
 * @param {string} recipientId - معرف المستلم
 * @param {string} createdBy - معرف المستخدم الذي أنشأ الإشعار
 */
export async function sendNotificationToUser(
  message,
  link = "",
  type = "system",
  recipientId,
  createdBy
) {
  try {
    const notification = new Notification({
      message,
      link,
      recipients: [recipientId],
      type,
      createdBy,
    });

    await notification.save();
  } catch (error) {
    throw error;
  }
}

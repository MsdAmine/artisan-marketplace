const redis = require("../db/redis");

function streamKeyForUser(userId) {
  return `notifications:stream:${userId}`;
}

function serializeNotificationPayload(notification) {
  return {
    notificationId: notification._id ? String(notification._id) : "",
    userId: notification.userId ? String(notification.userId) : "",
    artisanId: notification.artisanId ? String(notification.artisanId) : "",
    followerId: notification.followerId ? String(notification.followerId) : "",
    followerName: notification.followerName || "",
    productId: notification.productId ? String(notification.productId) : "",
    productName: notification.productName ? String(notification.productName) : "",
    type: notification.type || "new_product",
    read: String(notification.read ?? false),
    createdAt: (notification.createdAt || new Date()).toISOString(),
  };
}

async function publishNotificationToStream(notification) {
  const userId = notification.userId;
  if (!userId) {
    return;
  }

  const message = serializeNotificationPayload(notification);
  await redis.xadd(streamKeyForUser(userId), message);
}

module.exports = {
  publishNotificationToStream,
  streamKeyForUser,
};

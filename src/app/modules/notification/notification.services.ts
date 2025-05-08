import prisma from '../../utils/prisma';

const CreateNotification = async (data: {
  user_id: string;
  message: string;
  type: string;
  related_event_id?: string;
}) => {
  const notification = await prisma.notification.create({
    data: {
      user_id: data.user_id,
      message: data.message,
      type: data.type,
      related_event_id: data.related_event_id,
    },
  });

  return notification;
};

const GetNotifications = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });

  return notifications;
};

const GetUserNotificationsCount = async (userId: string) => {
  const notifications = await prisma.notification.count({
    where: { user_id: userId, is_read: false },
  });

  return notifications;
};

const MarkNotificationAsRead = async (notificationId: string) => {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true },
  });

  return notification;
};

const MarkAllNotificationsAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: {
      user_id: userId,
      is_read: false,
    },
    data: { is_read: true },
  });

  return { success: true };
};

const NotificationService = {
  CreateNotification,
  GetNotifications,
  MarkNotificationAsRead,
  MarkAllNotificationsAsRead,
  GetUserNotificationsCount,
};

export default NotificationService;

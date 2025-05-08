import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import NotificationService from './notification.services';

const GetNotifications = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const notifications = await NotificationService.GetNotifications(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications fetched successfully',
    data: notifications,
  });
});

const GetUserNotificationsCount = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const notificationsCount =
    await NotificationService.GetUserNotificationsCount(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications count fetched successfully',
    data: notificationsCount,
  });
});

const MarkNotificationAsRead = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const notification =
    await NotificationService.MarkNotificationAsRead(notificationId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
});

const MarkAllNotificationsAsRead = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const result = await NotificationService.MarkAllNotificationsAsRead(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
});

const NotificationController = {
  GetNotifications,
  GetUserNotificationsCount,
  MarkNotificationAsRead,
  MarkAllNotificationsAsRead,
};

export default NotificationController;

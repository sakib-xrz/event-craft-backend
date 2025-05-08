import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import NotificationController from './notification.controller';

const router = express.Router();

router.get('/', auth(Role.USER), NotificationController.GetNotifications);

router.get(
  '/count',
  auth(Role.USER),
  NotificationController.GetUserNotificationsCount,
);

router.patch(
  '/:notificationId/read',
  auth(Role.USER),
  NotificationController.MarkNotificationAsRead,
);

router.patch(
  '/read-all',
  auth(Role.USER),
  NotificationController.MarkAllNotificationsAsRead,
);

export const NotificationRoutes = router;

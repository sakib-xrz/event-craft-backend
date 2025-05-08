"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../utils/prisma"));
const CreateNotification = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield prisma_1.default.notification.create({
        data: {
            user_id: data.user_id,
            message: data.message,
            type: data.type,
            related_event_id: data.related_event_id,
        },
    });
    return notification;
});
const GetNotifications = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield prisma_1.default.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
    });
    return notifications;
});
const GetUserNotificationsCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield prisma_1.default.notification.count({
        where: { user_id: userId, is_read: false },
    });
    return notifications;
});
const MarkNotificationAsRead = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield prisma_1.default.notification.update({
        where: { id: notificationId },
        data: { is_read: true },
    });
    return notification;
});
const MarkAllNotificationsAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.updateMany({
        where: {
            user_id: userId,
            is_read: false,
        },
        data: { is_read: true },
    });
    return { success: true };
});
const NotificationService = {
    CreateNotification,
    GetNotifications,
    MarkNotificationAsRead,
    MarkAllNotificationsAsRead,
    GetUserNotificationsCount,
};
exports.default = NotificationService;

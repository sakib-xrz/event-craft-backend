"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const notification_controller_1 = __importDefault(require("./notification.controller"));
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(client_1.Role.USER), notification_controller_1.default.GetNotifications);
router.get('/count', (0, auth_1.default)(client_1.Role.USER), notification_controller_1.default.GetUserNotificationsCount);
router.patch('/:notificationId/read', (0, auth_1.default)(client_1.Role.USER), notification_controller_1.default.MarkNotificationAsRead);
router.patch('/read-all', (0, auth_1.default)(client_1.Role.USER), notification_controller_1.default.MarkAllNotificationsAsRead);
exports.NotificationRoutes = router;

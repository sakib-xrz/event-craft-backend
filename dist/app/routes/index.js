"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const user_routes_1 = require("../modules/user/user.routes");
const event_routes_1 = require("../modules/event/event.routes");
const participant_routes_1 = require("../modules/participant/participant.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const invitation_routes_1 = require("../modules/invitation/invitation.routes");
const notification_routes_1 = require("../modules/notification/notification.routes");
const review_routes_1 = require("../modules/review/review.routes");
const router = express_1.default.Router();
const routes = [
    {
        path: '/auth',
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: '/users',
        route: user_routes_1.UserRoutes,
    },
    {
        path: '/events',
        route: event_routes_1.EventRoutes,
    },
    {
        path: '/participants',
        route: participant_routes_1.ParticipantRoutes,
    },
    {
        path: '/payments',
        route: payment_routes_1.PaymentRoutes,
    },
    {
        path: '/invitations',
        route: invitation_routes_1.InvitationRoutes,
    },
    {
        path: '/notifications',
        route: notification_routes_1.NotificationRoutes,
    },
    {
        path: '/reviews',
        route: review_routes_1.ReviewRoutes,
    },
];
routes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;

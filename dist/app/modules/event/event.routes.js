"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const event_controller_1 = __importDefault(require("./event.controller"));
const router = express_1.default.Router();
router
    .route('/')
    .post((0, auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), event_controller_1.default.CreateEvent)
    .get(event_controller_1.default.GetEvents);
router.post('/bulk', (0, auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), event_controller_1.default.CreateEvents);
router
    .route('/:id')
    .get(event_controller_1.default.GetEvent)
    .patch((0, auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), event_controller_1.default.UpdateEvent)
    .delete((0, auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), event_controller_1.default.DeleteEvent);
router
    .route('/:id/status')
    .patch((0, auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), event_controller_1.default.UpdateStatus);
router.post('/:id/join', (0, auth_1.default)(client_1.Role.USER), event_controller_1.default.JoinEvent);
router.get('/:id/participants', (0, auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), event_controller_1.default.GetParticipants);
router
    .route('/:id/reviews')
    .get((0, auth_1.default)(client_1.Role.USER), event_controller_1.default.GetReviews)
    .post((0, auth_1.default)(client_1.Role.USER), event_controller_1.default.SubmitReview);
exports.EventRoutes = router;

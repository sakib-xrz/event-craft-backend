"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const invitation_controller_1 = __importDefault(require("./invitation.controller"));
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(client_1.Role.USER), invitation_controller_1.default.SendInvitation);
router.get('/received', (0, auth_1.default)(client_1.Role.USER), invitation_controller_1.default.GetReceivedInvitations);
router.get('/sent', (0, auth_1.default)(client_1.Role.USER), invitation_controller_1.default.GetSentInvitations);
router.patch('/:id/accept', (0, auth_1.default)(client_1.Role.USER), invitation_controller_1.default.AcceptInvitation);
router.patch('/:id/decline', (0, auth_1.default)(client_1.Role.USER), invitation_controller_1.default.DeclineInvitation);
exports.InvitationRoutes = router;

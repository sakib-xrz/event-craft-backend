"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const participant_controller_1 = __importDefault(require("./participant.controller"));
const router = express_1.default.Router();
router.patch('/:id/approve', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), participant_controller_1.default.ApproveParticipant);
router.patch('/:id/reject', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), participant_controller_1.default.RejectParticipant);
router.patch('/:id/ban', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), participant_controller_1.default.BanParticipant);
exports.ParticipantRoutes = router;

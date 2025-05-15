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
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const ApproveParticipant = (participantId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findUnique({
        where: { id: participantId },
    });
    if (!participant) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant not found');
    }
    if (participant.approval_status !== client_1.ApprovalStatus.PENDING) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Participant is not pending');
    }
    if (user.role !== client_1.Role.ADMIN && participant.user_id !== user.id) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not allowed to approve this participant');
    }
    const result = yield prisma_1.default.participant.update({
        where: { id: participantId },
        data: {
            approval_status: client_1.ApprovalStatus.APPROVED,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant not found');
    }
    return result;
});
const RejectParticipant = (participantId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findUnique({
        where: { id: participantId },
    });
    if (!participant) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant not found');
    }
    if (user.role !== client_1.Role.ADMIN && participant.user_id !== user.id) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not allowed to reject this participant');
    }
    const result = yield prisma_1.default.participant.update({
        where: { id: participantId },
        data: { approval_status: client_1.ApprovalStatus.REJECTED },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant not found');
    }
    return result;
});
const BanParticipant = (participantId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findUnique({
        where: { id: participantId },
    });
    if (!participant) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant not found');
    }
    if (user.role !== client_1.Role.ADMIN && participant.user_id !== user.id) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not allowed to ban this participant');
    }
    const result = yield prisma_1.default.participant.update({
        where: { id: participantId },
        data: { is_banned: true },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant not found');
    }
    return result;
});
const GetParticipantByToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield prisma_1.default.participant.findUnique({
        where: { token },
        include: {
            event: {
                select: {
                    title: true,
                    is_virtual: true,
                    date_time: true,
                    venue: true,
                },
            },
        },
    });
    if (!participant) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Participant not found');
    }
    return participant;
});
const ParticipantService = {
    ApproveParticipant,
    RejectParticipant,
    BanParticipant,
    GetParticipantByToken,
};
exports.default = ParticipantService;

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
exports.setSocketIO = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const client_1 = require("@prisma/client");
const payment_utils_1 = __importDefault(require("../payment/payment.utils"));
const socket_1 = require("../../socket");
const participant_utils_1 = __importDefault(require("../participant/participant.utils"));
// Add a reference to the io instance
let io = null;
// Add this function to set the io instance
const setSocketIO = (socketIO) => {
    io = socketIO;
};
exports.setSocketIO = setSocketIO;
const SendInvitation = (eventId, userId, receiver_id) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.default.event.findUnique({
        where: { id: eventId },
    });
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    const invitation = yield prisma_1.default.invitation.create({
        data: {
            event_id: eventId,
            sender_id: userId,
            receiver_id: receiver_id,
            is_paid_event: event.is_paid,
        },
    });
    if (io) {
        // Fetch sender and event details for the notification
        const sender = yield prisma_1.default.user.findUnique({
            where: { id: invitation.sender_id },
        });
        const event = yield prisma_1.default.event.findUnique({
            where: { id: invitation.event_id },
        });
        if (sender && event) {
            (0, socket_1.sendInvitationNotification)(io, invitation.receiver_id, {
                type: 'INVITATION_RECEIVED',
                message: `${sender.full_name} invited you to ${event.title}`,
                senderId: invitation.sender_id,
                senderName: sender.full_name || 'A user',
                eventId: invitation.event_id,
                eventTitle: event.title,
            });
        }
    }
    return invitation;
});
const GetReceivedInvitations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const invitations = yield prisma_1.default.invitation.findMany({
        where: { receiver_id: userId },
    });
    return invitations;
});
const GetSentInvitations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const invitations = yield prisma_1.default.invitation.findMany({
        where: { sender_id: userId },
    });
    return invitations;
});
const AcceptInvitation = (invitationId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const invitation = yield tx.invitation.findUnique({
            where: { id: invitationId },
            select: {
                id: true,
                event_id: true,
                receiver_id: true,
                invitation_status: true,
                is_paid_event: true,
                payment_status: true,
                event: {
                    select: {
                        id: true,
                        is_paid: true,
                        is_public: true,
                        registration_fee: true,
                    },
                },
            },
        });
        if (!invitation) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invitation not found');
        }
        if (invitation.invitation_status !== client_1.InvitationStatus.PENDING) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invitation is not pending');
        }
        if (invitation.is_paid_event &&
            invitation.payment_status !== client_1.PaymentStatus.PAID) {
            // need implement payment gateway
            yield tx.payment.create({
                data: {
                    event_id: invitation.event_id,
                    user_id: invitation.receiver_id,
                    amount: invitation.event.registration_fee,
                    transaction_id: payment_utils_1.default.generateTransactionId(),
                },
            });
        }
        // Update invitation status
        yield tx.invitation.update({
            where: { id: invitationId },
            data: {
                invitation_status: client_1.InvitationStatus.ACCEPTED,
            },
        });
        // Create participant record
        const participant = yield tx.participant.create({
            data: {
                event_id: invitation.event_id,
                user_id: invitation.receiver_id,
                token: participant_utils_1.default.GenerateToken(),
                payment_status: invitation.is_paid_event
                    ? client_1.PaymentStatus.PENDING
                    : client_1.PaymentStatus.FREE,
                approval_status: invitation.event.is_public
                    ? client_1.ApprovalStatus.APPROVED
                    : client_1.ApprovalStatus.PENDING,
            },
        });
        if (io) {
            const invitation = yield prisma_1.default.invitation.findUnique({
                where: { id: invitationId },
                include: {
                    event: true,
                    receiver: true,
                },
            });
            if (invitation) {
                (0, socket_1.sendInvitationStatusNotification)(io, invitation.sender_id, {
                    type: 'INVITATION_ACCEPTED',
                    message: `${invitation.receiver.full_name} accepted your invitation to ${invitation.event.title}`,
                    receiverId: invitation.receiver_id,
                    receiverName: invitation.receiver.full_name || 'A user',
                    eventId: invitation.event_id,
                    eventTitle: invitation.event.title,
                });
            }
        }
        return participant;
    }));
});
const DeclineInvitation = (invitationId) => __awaiter(void 0, void 0, void 0, function* () {
    const invitation = yield prisma_1.default.invitation.findUnique({
        where: { id: invitationId },
    });
    if (!invitation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invitation not found');
    }
    if (invitation.invitation_status !== client_1.InvitationStatus.PENDING) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invitation is not pending');
    }
    yield prisma_1.default.invitation.update({
        where: { id: invitationId },
        data: {
            invitation_status: client_1.InvitationStatus.DECLINED,
        },
    });
    if (io) {
        const invitation = yield prisma_1.default.invitation.findUnique({
            where: { id: invitationId },
            include: {
                event: true,
                receiver: true,
            },
        });
        if (invitation) {
            (0, socket_1.sendInvitationStatusNotification)(io, invitation.sender_id, {
                type: 'INVITATION_DECLINED',
                message: `${invitation.receiver.full_name} declined your invitation to ${invitation.event.title}`,
                receiverId: invitation.receiver_id,
                receiverName: invitation.receiver.full_name || 'A user',
                eventId: invitation.event_id,
                eventTitle: invitation.event.title,
            });
        }
    }
});
const InvitationService = {
    SendInvitation,
    GetReceivedInvitations,
    GetSentInvitations,
    AcceptInvitation,
    DeclineInvitation,
};
exports.default = InvitationService;

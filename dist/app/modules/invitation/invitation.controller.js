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
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const invitation_services_1 = __importDefault(require("./invitation.services"));
const SendInvitation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId, receiver_id } = req.body;
    const { id: userId } = req.user;
    const invitation = yield invitation_services_1.default.SendInvitation(eventId, userId, receiver_id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Invitation sent successfully',
        data: invitation,
    });
}));
const GetReceivedInvitations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const invitations = yield invitation_services_1.default.GetReceivedInvitations(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Received invitations fetched successfully',
        data: invitations,
    });
}));
const GetSentInvitations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const invitations = yield invitation_services_1.default.GetSentInvitations(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Sent invitations fetched successfully',
        data: invitations,
    });
}));
const AcceptInvitation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { invitationId } = req.body;
    const invitation = yield invitation_services_1.default.AcceptInvitation(invitationId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Invitation accepted successfully',
        data: invitation,
    });
}));
const DeclineInvitation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { invitationId } = req.body;
    const invitation = yield invitation_services_1.default.DeclineInvitation(invitationId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Invitation declined successfully',
        data: invitation,
    });
}));
const InvitationController = {
    SendInvitation,
    GetReceivedInvitations,
    GetSentInvitations,
    AcceptInvitation,
    DeclineInvitation,
};
exports.default = InvitationController;

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
const participant_services_1 = __importDefault(require("./participant.services"));
const ApproveParticipant = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const participantId = req.params.id;
    const user = req.user;
    const result = yield participant_services_1.default.ApproveParticipant(participantId, user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Participant approved successfully',
        data: result,
    });
}));
const RejectParticipant = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const participantId = req.params.id;
    const user = req.user;
    const result = yield participant_services_1.default.RejectParticipant(participantId, user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Participant rejected successfully',
        data: result,
    });
}));
const BanParticipant = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const participantId = req.params.id;
    const user = req.user;
    const result = yield participant_services_1.default.BanParticipant(participantId, user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Participant banned successfully',
        data: result,
    });
}));
const GetParticipantByToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    const result = yield participant_services_1.default.GetParticipantByToken(token);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Participant fetched successfully',
        data: result,
    });
}));
const ParticipantController = {
    ApproveParticipant,
    RejectParticipant,
    BanParticipant,
    GetParticipantByToken,
};
exports.default = ParticipantController;

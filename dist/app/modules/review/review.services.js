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
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const UpdateReview = (reviewId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if review exists
    const review = yield prisma_1.default.review.findUnique({
        where: { id: reviewId },
        include: {
            event: true,
        },
    });
    if (!review) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Review not found');
    }
    // Check if user is the review owner
    if (review.user_id !== user.id && user.role !== client_1.Role.ADMIN) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to update this review');
    }
    // Check review window (within 7 days of event completion)
    if (review.event.status === client_1.EventStatus.COMPLETED) {
        const eventDate = new Date(review.event.date_time);
        const currentDate = new Date();
        const daysDifference = (currentDate.getTime() - eventDate.getTime()) / (1000 * 3600 * 24);
        if (daysDifference > 7 && user.role !== client_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Review can only be updated within 7 days of event completion');
        }
    }
    // Update review
    const result = yield prisma_1.default.review.update({
        where: { id: reviewId },
        data: {
            rating: payload.rating,
            comment: payload.comment,
        },
    });
    return result;
});
const DeleteReview = (reviewId, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if review exists
    const review = yield prisma_1.default.review.findUnique({
        where: { id: reviewId },
    });
    if (!review) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Review not found');
    }
    // Check if user is the review owner or admin
    if (review.user_id !== user.id && user.role !== client_1.Role.ADMIN) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to delete this review');
    }
    // Delete review
    yield prisma_1.default.review.delete({
        where: { id: reviewId },
    });
});
const ReviewService = {
    UpdateReview,
    DeleteReview,
};
exports.default = ReviewService;

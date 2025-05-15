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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const pagination_1 = __importDefault(require("../../utils/pagination"));
const event_constant_1 = __importDefault(require("./event.constant"));
const payment_utils_1 = __importDefault(require("../payment/payment.utils"));
const participant_utils_1 = __importDefault(require("../participant/participant.utils"));
const CreateEvent = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.event.create({
        data: Object.assign(Object.assign({}, payload), { date_time: new Date(payload.date_time), organizer_id: user.id }),
    });
    return result;
});
const CreateEvents = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const payloads = payload.map((event) => {
        return Object.assign(Object.assign({}, event), { date_time: new Date(event.date_time), organizer_id: user.id });
    });
    const result = yield prisma_1.default.event.createMany({
        data: payloads,
    });
    return result;
});
const GetEvents = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = (0, pagination_1.default)(options);
    const { search } = filters, restFilters = __rest(filters, ["search"]);
    const andConditions = [];
    if (search) {
        andConditions.push({
            OR: event_constant_1.default.SearchableFields.map((field) => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(restFilters).length > 0) {
        andConditions.push({
            AND: Object.keys(restFilters).map((key) => {
                const value = restFilters[key];
                const processedValue = value === 'true' ? true : value === 'false' ? false : value;
                return {
                    [key]: {
                        equals: processedValue,
                    },
                };
            }),
        });
    }
    andConditions.push({
        is_deleted: false,
    });
    const whereConditions = {
        AND: andConditions,
    };
    const data = yield prisma_1.default.event.findMany({
        where: whereConditions,
        select: {
            id: true,
            title: true,
            description: true,
            date_time: true,
            venue: true,
            is_featured: true,
            is_public: true,
            is_paid: true,
            is_virtual: true,
            registration_fee: true,
            status: true,
            organizer: {
                select: {
                    full_name: true,
                },
            },
        },
        skip,
        take: limit,
        orderBy: options.sort_by && options.sort_order
            ? {
                [options.sort_by]: options.sort_order,
            }
            : {
                created_at: 'desc',
            },
    });
    const total = yield prisma_1.default.event.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };
});
const GetEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.event.findUnique({
        where: { id, is_deleted: false },
        select: {
            id: true,
            title: true,
            description: true,
            date_time: true,
            venue: true,
            is_featured: true,
            is_public: true,
            is_paid: true,
            is_virtual: true,
            registration_fee: true,
            status: true,
            organizer: {
                select: {
                    full_name: true,
                    email: true,
                },
            },
            participants: {
                select: {
                    user: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                        },
                    },
                },
            },
            reviews: {
                select: {
                    user: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                        },
                    },
                    rating: true,
                    comment: true,
                    created_at: true,
                },
                orderBy: { created_at: 'desc' },
            },
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    return result;
});
const GetFeaturedEvent = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.event.findFirst({
        where: {
            is_featured: true,
            is_deleted: false,
        },
        select: {
            id: true,
            title: true,
            description: true,
            date_time: true,
            venue: true,
            is_public: true,
            is_paid: true,
            is_virtual: true,
            registration_fee: true,
            status: true,
            organizer: {
                select: {
                    full_name: true,
                },
            },
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Featured event not found');
    }
    return result;
});
const UpdateEvent = (id, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    let hasPermission = false;
    if (user.role === client_1.Role.ADMIN) {
        hasPermission = true;
    }
    else {
        const event = yield prisma_1.default.event.findUnique({
            where: { id, is_deleted: false },
        });
        if (!event) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
        }
        if (event.organizer_id !== user.id) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to update this event');
        }
        if (event.status === client_1.EventStatus.COMPLETED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You cannot update a completed event');
        }
        if (event.status === client_1.EventStatus.CANCELLED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You cannot update a cancelled event');
        }
    }
    if (!hasPermission) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to update this event');
    }
    const result = yield prisma_1.default.event.update({
        where: { id },
        data: Object.assign({}, payload),
    });
    return result;
});
const DeleteEvent = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    let hasPermission = false;
    if (user.role === client_1.Role.ADMIN) {
        hasPermission = true;
    }
    else {
        const event = yield prisma_1.default.event.findUnique({
            where: { id, is_deleted: false },
        });
        if (!event) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
        }
        if (event.organizer_id !== user.id) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to delete this event');
        }
    }
    if (!hasPermission) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to delete this event');
    }
    yield prisma_1.default.event.update({
        where: { id },
        data: { is_deleted: true },
    });
});
const UpdateStatus = (id, status, user) => __awaiter(void 0, void 0, void 0, function* () {
    let hasPermission = false;
    if (user.role === client_1.Role.ADMIN) {
        hasPermission = true;
    }
    else {
        const event = yield prisma_1.default.event.findUnique({
            where: { id, is_deleted: false },
        });
        if (!event) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
        }
        if (event.organizer_id !== user.id) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to update this event');
        }
        if (event.status === client_1.EventStatus.COMPLETED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You cannot update the status of a completed event');
        }
        if (event.status === client_1.EventStatus.CANCELLED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You cannot update the status of a cancelled event');
        }
    }
    if (!hasPermission) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to update this event');
    }
    const result = yield prisma_1.default.event.update({
        where: { id },
        data: {
            status,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    return result;
});
const JoinEvent = (eventId, user) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const event = yield tx.event.findUnique({
            where: { id: eventId, is_deleted: false },
        });
        if (!event) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
        }
        const participant = yield tx.participant.findUnique({
            where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
        });
        if (participant) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are already a participant');
        }
        if (event.status === client_1.EventStatus.COMPLETED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Event is completed');
        }
        if (event.status === client_1.EventStatus.CANCELLED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Event is cancelled');
        }
        let result;
        if (event.is_public && !event.is_paid) {
            console.log('Public event with no payment');
            // instant acceptance
            result = yield tx.participant.create({
                data: {
                    event_id: eventId,
                    user_id: user.id,
                    token: participant_utils_1.default.GenerateToken(),
                    payment_status: client_1.PaymentStatus.FREE,
                    approval_status: client_1.ApprovalStatus.APPROVED,
                },
            });
        }
        else if (event.is_public && event.is_paid) {
            // payment flow
            yield tx.payment.create({
                data: {
                    event_id: eventId,
                    user_id: user.id,
                    amount: event.registration_fee,
                    transaction_id: payment_utils_1.default.generateTransactionId(),
                },
            });
            result = yield tx.participant.create({
                data: {
                    event_id: eventId,
                    user_id: user.id,
                    token: participant_utils_1.default.GenerateToken(),
                    payment_status: client_1.PaymentStatus.PENDING,
                    approval_status: client_1.ApprovalStatus.PENDING,
                },
            });
        }
        else if (!event.is_public && event.is_paid) {
            // payment flow
            yield tx.payment.create({
                data: {
                    event_id: eventId,
                    user_id: user.id,
                    amount: event.registration_fee,
                    transaction_id: payment_utils_1.default.generateTransactionId(),
                },
            });
            result = yield tx.participant.create({
                data: {
                    event_id: eventId,
                    user_id: user.id,
                    token: participant_utils_1.default.GenerateToken(),
                    payment_status: client_1.PaymentStatus.PENDING,
                    approval_status: client_1.ApprovalStatus.PENDING,
                },
            });
        }
        else if (!event.is_public && !event.is_paid) {
            // pending approval
            result = yield tx.participant.create({
                data: {
                    event_id: eventId,
                    user_id: user.id,
                    token: participant_utils_1.default.GenerateToken(),
                    payment_status: client_1.PaymentStatus.FREE,
                    approval_status: client_1.ApprovalStatus.PENDING,
                },
            });
        }
        return result;
    }));
});
const GetParticipants = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.participant.findMany({
        where: { event_id: eventId },
        include: {
            user: true,
        },
    });
    return result;
});
const SubmitReview = (eventId, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if event exists and is completed
    const event = yield prisma_1.default.event.findUnique({
        where: { id: eventId, is_deleted: false },
    });
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    if (event.status !== client_1.EventStatus.COMPLETED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You can only review completed events');
    }
    // Check if user participated in the event
    const participant = yield prisma_1.default.participant.findUnique({
        where: {
            event_id_user_id: {
                event_id: eventId,
                user_id: user.id,
            },
        },
    });
    if (!participant) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You must be a participant to review this event');
    }
    // Check if user already reviewed this event
    const existingReview = yield prisma_1.default.review.findUnique({
        where: {
            user_id_event_id: {
                user_id: user.id,
                event_id: eventId,
            },
        },
    });
    if (existingReview) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You have already reviewed this event');
    }
    // Create review
    const result = yield prisma_1.default.review.create({
        data: {
            user_id: user.id,
            event_id: eventId,
            rating: payload.rating,
            comment: payload.comment,
        },
    });
    return result;
});
const GetReviews = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if event exists
    const event = yield prisma_1.default.event.findUnique({
        where: { id: eventId, is_deleted: false },
    });
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    // Get all reviews for the event
    const reviews = yield prisma_1.default.review.findMany({
        where: { event_id: eventId },
        include: {
            user: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                },
            },
        },
        orderBy: { created_at: 'desc' },
    });
    return reviews;
});
const EventService = {
    CreateEvent,
    CreateEvents,
    GetEvents,
    GetEvent,
    GetFeaturedEvent,
    UpdateEvent,
    DeleteEvent,
    UpdateStatus,
    JoinEvent,
    GetParticipants,
    SubmitReview,
    GetReviews,
};
exports.default = EventService;

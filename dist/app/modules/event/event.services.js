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
const pagination_1 = __importDefault(require("../../utils/pagination"));
const event_constant_1 = __importDefault(require("./event.constant"));
const CreateEvent = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.event.create({
        data: Object.assign(Object.assign({}, payload), { date_time: new Date(payload.date_time), organizer_id: user.id }),
    });
    return result;
});
const GetEvents = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = (0, pagination_1.default)(options);
    const { search } = filters;
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
    andConditions.push({
        is_deleted: false,
    });
    const whereConditions = {
        AND: andConditions,
    };
    const data = yield prisma_1.default.event.findMany({
        where: whereConditions,
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
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
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
const EventService = {
    CreateEvent,
    GetEvents,
    GetEvent,
    UpdateEvent,
    DeleteEvent,
    UpdateStatus,
};
exports.default = EventService;

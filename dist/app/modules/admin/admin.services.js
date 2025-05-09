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
const pagination_1 = __importDefault(require("../../utils/pagination"));
const admin_constant_1 = require("./admin.constant");
const GetAllUsers = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = (0, pagination_1.default)(options);
    const { search } = filters, filterData = __rest(filters, ["search"]);
    const andConditions = [];
    if (search) {
        andConditions.push({
            OR: admin_constant_1.UserSearchableFields.map((field) => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive',
                },
            })),
        });
    }
    // Exact match filters
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.entries(filterData).map(([field, value]) => ({
                [field]: value,
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const data = yield prisma_1.default.user.findMany({
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
        select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
            is_deleted: true,
            created_at: true,
            updated_at: true,
        },
    });
    const total = yield prisma_1.default.user.count({
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
const DeleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const user = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Soft delete the user
    const result = yield prisma_1.default.user.update({
        where: { id },
        data: { is_deleted: true },
    });
    return result;
});
const GetAllEvents = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = (0, pagination_1.default)(options);
    const { search } = filters, filterData = __rest(filters, ["search"]);
    const andConditions = [];
    if (search) {
        andConditions.push({
            OR: admin_constant_1.EventSearchableFields.map((field) => ({
                [field]: {
                    contains: search,
                    mode: 'insensitive',
                },
            })),
        });
    }
    // Exact match filters
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.entries(filterData).map(([field, value]) => ({
                [field]: value,
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
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
        include: {
            organizer: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                },
            },
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
const DeleteEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if event exists
    const event = yield prisma_1.default.event.findUnique({
        where: { id },
    });
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    // Soft delete the event
    const result = yield prisma_1.default.event.update({
        where: { id },
        data: { is_deleted: true },
    });
    return result;
});
const AdminService = {
    GetAllUsers,
    DeleteUser,
    GetAllEvents,
    DeleteEvent,
};
exports.default = AdminService;

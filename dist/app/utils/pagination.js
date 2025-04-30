"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calculatePagination = (options) => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = options.sort || 'created_at';
    const order = options.order || 'desc';
    return {
        page,
        limit,
        sort,
        order,
        skip,
    };
};
exports.default = calculatePagination;

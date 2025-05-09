"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSearchableFields = exports.EventFilterableFields = exports.UserSearchableFields = exports.UserFilterableFields = void 0;
exports.UserFilterableFields = [
    'email',
    'full_name',
    'role',
    'is_deleted',
    'search',
];
exports.UserSearchableFields = ['email', 'full_name'];
exports.EventFilterableFields = [
    'title',
    'status',
    'is_paid',
    'is_public',
    'is_virtual',
    'is_deleted',
    'organizer_id',
    'search',
];
exports.EventSearchableFields = ['title', 'description', 'venue'];

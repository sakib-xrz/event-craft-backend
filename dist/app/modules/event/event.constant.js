"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FilterableFields = [
    'search',
    'is_featured',
    'is_public',
    'is_paid',
    'is_virtual',
    'status',
    'approval_status',
];
const SearchableFields = ['title'];
const EventConstants = {
    FilterableFields,
    SearchableFields,
};
exports.default = EventConstants;

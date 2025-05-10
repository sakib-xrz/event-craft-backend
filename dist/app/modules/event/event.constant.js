"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FilterableFields = [
    'search',
    'is_featured',
    'is_public',
    'is_paid',
    'is_virtual',
    'status',
];
const SearchableFields = ['title', 'description', 'organizer.full_name'];
const EventConstants = {
    FilterableFields,
    SearchableFields,
};
exports.default = EventConstants;

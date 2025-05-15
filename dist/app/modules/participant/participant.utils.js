"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const GenerateToken = () => {
    const uuid = (0, uuid_1.v4)();
    const alphanumeric = uuid.replace(/[^a-z0-9]/gi, '');
    return alphanumeric.substring(0, 8).toUpperCase();
};
const ParticipantUtils = {
    GenerateToken,
};
exports.default = ParticipantUtils;

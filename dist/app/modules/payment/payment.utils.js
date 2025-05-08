"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
function generateTransactionId() {
    const uuid = (0, uuid_1.v4)();
    const alphanumeric = uuid.replace(/[^a-z0-9]/gi, '');
    return `TRX-${alphanumeric.substring(0, 10).toUpperCase()}`;
}
const PaymentUtils = {
    generateTransactionId,
};
exports.default = PaymentUtils;

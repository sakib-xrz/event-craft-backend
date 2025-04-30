"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pick = (object, keys) => {
    const result = {};
    for (const key of keys) {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            result[key] = object[key];
        }
    }
    return result;
};
exports.default = pick;

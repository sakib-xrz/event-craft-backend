"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const admin_controller_1 = __importDefault(require("./admin.controller"));
const router = express_1.default.Router();
router.route('/users').get((0, auth_1.default)(client_1.Role.ADMIN), admin_controller_1.default.GetAllUsers);
router
    .route('/users/:id/delete')
    .patch((0, auth_1.default)(client_1.Role.ADMIN), admin_controller_1.default.DeleteUser);
router.route('/events').get((0, auth_1.default)(client_1.Role.ADMIN), admin_controller_1.default.GetAllEvents);
router
    .route('/events/:id/delete')
    .patch((0, auth_1.default)(client_1.Role.ADMIN), admin_controller_1.default.DeleteEvent);
exports.AdminRoutes = router;

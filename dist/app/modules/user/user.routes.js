"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("./user.controller"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(client_1.Role.ADMIN), user_controller_1.default.GetUsers);
router
    .route('/:id')
    .get((0, auth_1.default)(client_1.Role.ADMIN), user_controller_1.default.GetUser)
    .delete((0, auth_1.default)(client_1.Role.ADMIN), user_controller_1.default.DeleteUser);
exports.UserRoutes = router;

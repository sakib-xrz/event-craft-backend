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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const socket_1 = require("./app/socket");
process.on('uncaughtException', (err) => {
    console.error(err);
    process.exit(1);
});
let server = null;
let io = null;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        server = new http_1.Server(app_1.default);
        // Initialize Socket.IO with CORS
        io = new socket_io_1.Server(server, {
            cors: {
                origin: ['http://localhost:3000'],
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });
        // Initialize socket handlers
        (0, socket_1.initializeSocketIO)(io);
        server.listen(config_1.default.port, () => {
            console.log(`🎯 Server listening on port: ${config_1.default.port}`);
            console.log(`🔌 Socket.IO initialized`);
        });
        process.on('unhandledRejection', (error) => {
            if (server) {
                server.close(() => {
                    console.log(error);
                    process.exit(1);
                });
            }
            else {
                process.exit(1);
            }
        });
    });
}
startServer();
process.on('SIGTERM', () => {
    if (server) {
        server.close();
    }
});

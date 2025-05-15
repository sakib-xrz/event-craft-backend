"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendParticipantStatusNotification = exports.sendInvitationStatusNotification = exports.sendInvitationNotification = exports.initializeSocketIO = void 0;
const notification_services_1 = __importDefault(require("../modules/notification/notification.services"));
// Map to store online users - userId -> socketId
const onlineUsers = new Map();
const initializeSocketIO = (io) => {
    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);
        // When user connects with their userId
        socket.on('user_connected', (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} connected with socket ${socket.id}`);
            console.log(`Online users: ${onlineUsers.size}`);
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            // Find and remove the disconnected user
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
            console.log(`Socket ${socket.id} disconnected`);
        });
    });
};
exports.initializeSocketIO = initializeSocketIO;
// Function to send invitation notification
const sendInvitationNotification = (io, receiverId, data) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    notification_services_1.default.CreateNotification({
        user_id: receiverId,
        message: data.message,
        type: data.type,
        related_event_id: data.eventId,
    });
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification', data);
        console.log(`Notification sent to user ${receiverId}`);
    }
};
exports.sendInvitationNotification = sendInvitationNotification;
// Function to send invitation status update notification
const sendInvitationStatusNotification = (io, senderId, data) => {
    const senderSocketId = onlineUsers.get(senderId);
    notification_services_1.default.CreateNotification({
        user_id: senderId,
        message: data.message,
        type: data.type,
        related_event_id: data.eventId,
    });
    if (senderSocketId) {
        io.to(senderSocketId).emit('notification', data);
        console.log(`Status notification sent to user ${senderId}`);
    }
};
exports.sendInvitationStatusNotification = sendInvitationStatusNotification;
// Function to send participant status notification
const sendParticipantStatusNotification = (io, userId, data) => {
    const userSocketId = onlineUsers.get(userId);
    notification_services_1.default.CreateNotification({
        user_id: userId,
        message: data.message,
        type: data.type,
        related_event_id: data.eventId,
    });
    if (userSocketId) {
        io.to(userSocketId).emit('notification', data);
        console.log(`Participant status notification sent to user ${userId}`);
    }
};
exports.sendParticipantStatusNotification = sendParticipantStatusNotification;

import { Server as SocketIOServer, Socket } from 'socket.io';
import NotificationService from '../modules/notification/notification.services';

// Map to store online users - userId -> socketId
const onlineUsers = new Map<string, string>();

export const initializeSocketIO = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`New connection: ${socket.id}`);

    // When user connects with their userId
    socket.on('user_connected', (userId: string) => {
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

// Function to send invitation notification
export const sendInvitationNotification = (
  io: SocketIOServer,
  receiverId: string,
  data: {
    type: 'INVITATION_RECEIVED';
    message: string;
    senderId: string;
    senderName: string;
    eventId: string;
    eventTitle: string;
  },
) => {
  const receiverSocketId = onlineUsers.get(receiverId);

  NotificationService.CreateNotification({
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

// Function to send invitation status update notification
export const sendInvitationStatusNotification = (
  io: SocketIOServer,
  senderId: string,
  data: {
    type: 'INVITATION_ACCEPTED' | 'INVITATION_DECLINED';
    message: string;
    receiverId: string;
    receiverName: string;
    eventId: string;
    eventTitle: string;
  },
) => {
  const senderSocketId = onlineUsers.get(senderId);

  NotificationService.CreateNotification({
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

// Function to send participant status notification
export const sendParticipantStatusNotification = (
  io: SocketIOServer,
  userId: string,
  data: {
    type: 'PARTICIPANT_APPROVED' | 'PARTICIPANT_REJECTED';
    message: string;
    eventId: string;
    eventTitle: string;
  },
) => {
  const userSocketId = onlineUsers.get(userId);

  NotificationService.CreateNotification({
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

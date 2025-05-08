import { Server as SocketIOServer } from 'socket.io';
import httpStatus from 'http-status';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import {
  InvitationStatus,
  PaymentStatus,
  ApprovalStatus,
} from '@prisma/client';
import PaymentUtils from '../payment/payment.utils';

import {
  sendInvitationNotification,
  sendInvitationStatusNotification,
} from '../../socket';

// Add a reference to the io instance
let io: SocketIOServer | null = null;

// Add this function to set the io instance
export const setSocketIO = (socketIO: SocketIOServer) => {
  io = socketIO;
};

const SendInvitation = async (
  eventId: string,
  userId: string,
  receiver_id: string,
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  const invitation = await prisma.invitation.create({
    data: {
      event_id: eventId,
      sender_id: userId,
      receiver_id: receiver_id,
      is_paid_event: event.is_paid,
    },
  });

  if (io) {
    // Fetch sender and event details for the notification
    const sender = await prisma.user.findUnique({
      where: { id: invitation.sender_id },
    });

    const event = await prisma.event.findUnique({
      where: { id: invitation.event_id },
    });

    if (sender && event) {
      sendInvitationNotification(io, invitation.receiver_id, {
        type: 'INVITATION_RECEIVED',
        message: `${sender.full_name} invited you to ${event.title}`,
        senderId: invitation.sender_id,
        senderName: sender.full_name || 'A user',
        eventId: invitation.event_id,
        eventTitle: event.title,
      });
    }
  }

  return invitation;
};

const GetReceivedInvitations = async (userId: string) => {
  const invitations = await prisma.invitation.findMany({
    where: { receiver_id: userId },
  });

  return invitations;
};

const GetSentInvitations = async (userId: string) => {
  const invitations = await prisma.invitation.findMany({
    where: { sender_id: userId },
  });

  return invitations;
};

const AcceptInvitation = async (invitationId: string) => {
  return await prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        event_id: true,
        receiver_id: true,
        invitation_status: true,
        is_paid_event: true,
        payment_status: true,
        event: {
          select: {
            id: true,
            is_paid: true,
            is_public: true,
            registration_fee: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new AppError(httpStatus.NOT_FOUND, 'Invitation not found');
    }

    if (invitation.invitation_status !== InvitationStatus.PENDING) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invitation is not pending');
    }

    if (
      invitation.is_paid_event &&
      invitation.payment_status !== PaymentStatus.PAID
    ) {
      // need implement payment gateway
      await tx.payment.create({
        data: {
          event_id: invitation.event_id,
          user_id: invitation.receiver_id,
          amount: invitation.event.registration_fee,
          transaction_id: PaymentUtils.generateTransactionId(),
        },
      });
    }

    // Update invitation status
    await tx.invitation.update({
      where: { id: invitationId },
      data: {
        invitation_status: InvitationStatus.ACCEPTED,
      },
    });

    // Create participant record
    const participant = await tx.participant.create({
      data: {
        event_id: invitation.event_id,
        user_id: invitation.receiver_id,
        payment_status: invitation.is_paid_event
          ? PaymentStatus.PENDING
          : PaymentStatus.FREE,
        approval_status: invitation.event.is_public
          ? ApprovalStatus.APPROVED
          : ApprovalStatus.PENDING,
      },
    });

    if (io) {
      const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
        include: {
          event: true,
          receiver: true,
        },
      });

      if (invitation) {
        sendInvitationStatusNotification(io, invitation.sender_id, {
          type: 'INVITATION_ACCEPTED',
          message: `${invitation.receiver.full_name} accepted your invitation to ${invitation.event.title}`,
          receiverId: invitation.receiver_id,
          receiverName: invitation.receiver.full_name || 'A user',
          eventId: invitation.event_id,
          eventTitle: invitation.event.title,
        });
      }
    }

    return participant;
  });
};

const DeclineInvitation = async (invitationId: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invitation not found');
  }

  if (invitation.invitation_status !== InvitationStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invitation is not pending');
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      invitation_status: InvitationStatus.DECLINED,
    },
  });

  if (io) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        event: true,
        receiver: true,
      },
    });

    if (invitation) {
      sendInvitationStatusNotification(io, invitation.sender_id, {
        type: 'INVITATION_DECLINED',
        message: `${invitation.receiver.full_name} declined your invitation to ${invitation.event.title}`,
        receiverId: invitation.receiver_id,
        receiverName: invitation.receiver.full_name || 'A user',
        eventId: invitation.event_id,
        eventTitle: invitation.event.title,
      });
    }
  }
};

const InvitationService = {
  SendInvitation,
  GetReceivedInvitations,
  GetSentInvitations,
  AcceptInvitation,
  DeclineInvitation,
};

export default InvitationService;

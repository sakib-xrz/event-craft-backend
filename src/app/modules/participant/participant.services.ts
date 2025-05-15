import { ApprovalStatus, Role } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';

const ApproveParticipant = async (participantId: string, user: JwtPayload) => {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!participant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Participant not found');
  }

  if (participant.approval_status !== ApprovalStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Participant is not pending');
  }

  if (user.role !== Role.ADMIN && participant.user_id !== user.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to approve this participant',
    );
  }

  const result = await prisma.participant.update({
    where: { id: participantId },
    data: {
      approval_status: ApprovalStatus.APPROVED,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Participant not found');
  }

  return result;
};

const RejectParticipant = async (participantId: string, user: JwtPayload) => {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!participant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Participant not found');
  }

  if (user.role !== Role.ADMIN && participant.user_id !== user.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to reject this participant',
    );
  }

  const result = await prisma.participant.update({
    where: { id: participantId },
    data: { approval_status: ApprovalStatus.REJECTED },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Participant not found');
  }

  return result;
};

const BanParticipant = async (participantId: string, user: JwtPayload) => {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!participant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Participant not found');
  }

  if (user.role !== Role.ADMIN && participant.user_id !== user.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to ban this participant',
    );
  }

  const result = await prisma.participant.update({
    where: { id: participantId },
    data: { is_banned: true },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Participant not found');
  }

  return result;
};

const GetParticipantByToken = async (token: string) => {
  const participant = await prisma.participant.findUnique({
    where: { token },
    include: {
      event: {
        select: {
          title: true,
          is_virtual: true,
          date_time: true,
          venue: true,
        },
      },
    },
  });

  if (!participant) {
    throw new AppError(httpStatus.NOT_FOUND, 'Participant not found');
  }

  return participant;
};

const ParticipantService = {
  ApproveParticipant,
  RejectParticipant,
  BanParticipant,
  GetParticipantByToken,
};

export default ParticipantService;

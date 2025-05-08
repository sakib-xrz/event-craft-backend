import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import {
  ApprovalStatus,
  Event,
  EventStatus,
  PaymentStatus,
  Prisma,
  Role,
} from '@prisma/client';
import calculatePagination, {
  IPaginationOptions,
} from '../../utils/pagination';
import EventConstants from './event.constant';
import { JwtPayload } from 'jsonwebtoken';
import PaymentUtils from '../payment/payment.utils';

interface IGetEventsParams {
  search?: string;
}

const CreateEvent = async (payload: Event, user: JwtPayload) => {
  const result = await prisma.event.create({
    data: {
      ...payload,
      date_time: new Date(payload.date_time),
      organizer_id: user.id,
    },
  });

  return result;
};

const GetEvents = async (
  filters: IGetEventsParams,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = calculatePagination(options);
  const { search } = filters;

  const andConditions: Prisma.EventWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: EventConstants.SearchableFields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    });
  }

  andConditions.push({
    is_deleted: false,
  });

  const whereConditions: Prisma.EventWhereInput = {
    AND: andConditions,
  };

  const data = await prisma.event.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sort_by && options.sort_order
        ? {
            [options.sort_by]: options.sort_order,
          }
        : {
            created_at: 'desc',
          },
  });

  const total = await prisma.event.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data,
  };
};

const GetEvent = async (id: string) => {
  const result = await prisma.event.findUnique({
    where: { id, is_deleted: false },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  return result;
};

const UpdateEvent = async (id: string, payload: Event, user: JwtPayload) => {
  let hasPermission = false;

  if (user.role === Role.ADMIN) {
    hasPermission = true;
  } else {
    const event = await prisma.event.findUnique({
      where: { id, is_deleted: false },
    });

    if (!event) {
      throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
    }

    if (event.organizer_id !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You do not have permission to update this event',
      );
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You cannot update a completed event',
      );
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You cannot update a cancelled event',
      );
    }
  }

  if (!hasPermission) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this event',
    );
  }

  const result = await prisma.event.update({
    where: { id },
    data: {
      ...payload,
    },
  });

  return result;
};

const DeleteEvent = async (id: string, user: JwtPayload) => {
  let hasPermission = false;

  if (user.role === Role.ADMIN) {
    hasPermission = true;
  } else {
    const event = await prisma.event.findUnique({
      where: { id, is_deleted: false },
    });

    if (!event) {
      throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
    }

    if (event.organizer_id !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You do not have permission to delete this event',
      );
    }
  }

  if (!hasPermission) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to delete this event',
    );
  }

  await prisma.event.update({
    where: { id },
    data: { is_deleted: true },
  });
};

const UpdateStatus = async (
  id: string,
  status: EventStatus,
  user: JwtPayload,
) => {
  let hasPermission = false;

  if (user.role === Role.ADMIN) {
    hasPermission = true;
  } else {
    const event = await prisma.event.findUnique({
      where: { id, is_deleted: false },
    });

    if (!event) {
      throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
    }

    if (event.organizer_id !== user.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You do not have permission to update this event',
      );
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You cannot update the status of a completed event',
      );
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You cannot update the status of a cancelled event',
      );
    }
  }

  if (!hasPermission) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this event',
    );
  }

  const result = await prisma.event.update({
    where: { id },
    data: {
      status,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  return result;
};

const JoinEvent = async (eventId: string, user: JwtPayload) => {
  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId, is_deleted: false },
    });

    if (!event) {
      throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
    }

    const participant = await tx.participant.findUnique({
      where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
    });

    if (participant) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You are already a participant',
      );
    }

    if (event.status === EventStatus.COMPLETED) {
      throw new AppError(httpStatus.FORBIDDEN, 'Event is completed');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new AppError(httpStatus.FORBIDDEN, 'Event is cancelled');
    }

    let result;

    if (event.is_public && !event.is_paid) {
      // instant acceptance
      result = await tx.participant.create({
        data: {
          event_id: eventId,
          user_id: user.id,
          payment_status: PaymentStatus.FREE,
          approval_status: ApprovalStatus.APPROVED,
        },
      });
    } else if (event.is_public && event.is_paid) {
      // payment flow
      await tx.payment.create({
        data: {
          event_id: eventId,
          user_id: user.id,
          amount: event.registration_fee,
          transaction_id: PaymentUtils.generateTransactionId(),
        },
      });
      result = await tx.participant.create({
        data: {
          event_id: eventId,
          user_id: user.id,
          payment_status: PaymentStatus.PENDING,
          approval_status: ApprovalStatus.PENDING,
        },
      });
    } else if (!event.is_public && event.is_paid) {
      // payment flow
      await tx.payment.create({
        data: {
          event_id: eventId,
          user_id: user.id,
          amount: event.registration_fee,
          transaction_id: PaymentUtils.generateTransactionId(),
        },
      });
      result = await tx.participant.create({
        data: {
          event_id: eventId,
          user_id: user.id,
          payment_status: PaymentStatus.PENDING,
          approval_status: ApprovalStatus.PENDING,
        },
      });
    } else if (!event.is_public && !event.is_paid) {
      // pending approval
      result = await tx.participant.create({
        data: {
          event_id: eventId,
          user_id: user.id,
          payment_status: PaymentStatus.FREE,
          approval_status: ApprovalStatus.PENDING,
        },
      });
    }

    return result;
  });
};

const GetParticipants = async (eventId: string) => {
  const result = await prisma.participant.findMany({
    where: { event_id: eventId },
    include: {
      user: true,
    },
  });

  return result;
};

const EventService = {
  CreateEvent,
  GetEvents,
  GetEvent,
  UpdateEvent,
  DeleteEvent,
  UpdateStatus,
  JoinEvent,
  GetParticipants,
};

export default EventService;

import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { Prisma } from '@prisma/client';
import calculatePagination, {
  IPaginationOptions,
} from '../../utils/pagination';
import { UserSearchableFields, EventSearchableFields } from './admin.constant';

interface IUserFilters {
  search?: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_deleted?: boolean;
}

interface IEventFilters {
  search?: string;
  title?: string;
  status?: string;
  is_paid?: boolean;
  is_public?: boolean;
  is_virtual?: boolean;
  is_deleted?: boolean;
  organizer_id?: string;
}

const GetAllUsers = async (
  filters: IUserFilters,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = calculatePagination(options);
  const { search, ...filterData } = filters;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: UserSearchableFields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    });
  }

  // Exact match filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const data = await prisma.user.findMany({
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
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      is_deleted: true,
      created_at: true,
      updated_at: true,
    },
  });

  const total = await prisma.user.count({
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

const DeleteUser = async (id: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Soft delete the user
  const result = await prisma.user.update({
    where: { id },
    data: { is_deleted: true },
  });

  return result;
};

const GetAllEvents = async (
  filters: IEventFilters,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = calculatePagination(options);
  const { search, ...filterData } = filters;

  const andConditions: Prisma.EventWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: EventSearchableFields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    });
  }

  // Exact match filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions: Prisma.EventWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

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
    include: {
      organizer: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
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

const DeleteEvent = async (id: string) => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  // Soft delete the event
  const result = await prisma.event.update({
    where: { id },
    data: { is_deleted: true },
  });

  return result;
};

const AdminService = {
  GetAllUsers,
  DeleteUser,
  GetAllEvents,
  DeleteEvent,
};

export default AdminService;

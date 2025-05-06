import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import calculatePagination, {
  IPaginationOptions,
} from '../../utils/pagination';
import { Prisma } from '@prisma/client';
import UserConstants from './user.constant';

interface IGetUsersParams {
  search?: string;
}

const GetUsers = async (
  params: IGetUsersParams,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = calculatePagination(options);
  const { search } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: UserConstants.SearchableFields.map((field) => ({
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

  const whereConditions: Prisma.UserWhereInput = {
    AND: andConditions,
  };

  const data = await prisma.user.findMany({
    where: whereConditions,
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      created_at: true,
    },
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

const GetUser = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id, is_deleted: false },
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      created_at: true,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

const DeleteUser = async (id: string) => {
  const result = await prisma.user.update({
    where: { id, is_deleted: false },
    data: { is_deleted: true },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};

const UserService = { GetUsers, GetUser, DeleteUser };

export default UserService;

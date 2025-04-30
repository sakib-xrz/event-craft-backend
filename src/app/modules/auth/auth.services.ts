import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import AuthUtils from './auth.utils';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import { ILogin, IRegister } from './auth.interface';

const Login = async (payload: ILogin) => {
  const user = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found with this email');
  }

  const isPasswordMatched = await await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const access_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string,
  );

  const refresh_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string,
  );

  return { access_token, refresh_token };
};

const Register = async (payload: IRegister) => {
  const isUserExists = await prisma.user.findFirst({
    where: { email: payload.email },
  });

  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      full_name: payload.full_name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
    },
  });

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const access_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string,
  );

  const refresh_token = AuthUtils.CreateToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string,
  );

  return { access_token, refresh_token };
};

const ChangePassword = async (
  payload: {
    old_password: string;
    new_password: string;
  },
  user: JwtPayload,
) => {
  const isUserValid = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (!isUserValid) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found');
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.old_password,
    isUserValid.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid password');
  }

  const hashedPassword = await bcrypt.hash(
    payload.new_password,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });
};

const AuthService = {
  Login,
  Register,
  ChangePassword,
};

export default AuthService;

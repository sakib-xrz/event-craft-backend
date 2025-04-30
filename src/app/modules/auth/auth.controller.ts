import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AuthService from './auth.services';

const Login = catchAsync(async (req, res) => {
  const result = await AuthService.Login(req.body);

  const { access_token, refresh_token } = result;

  res.cookie('REFRESH_TOKEN', refresh_token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Login successful',
    data: {
      access_token,
    },
  });
});

const Register = catchAsync(async (req, res) => {
  const result = await AuthService.Register(req.body);

  const { access_token, refresh_token } = result;

  res.cookie('REFRESH_TOKEN', refresh_token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: {
      access_token,
    },
  });
});

const ChangePassword = catchAsync(async (req, res) => {
  await AuthService.ChangePassword(req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
  });
});

const AuthController = {
  Login,
  Register,
  ChangePassword,
};

export default AuthController;

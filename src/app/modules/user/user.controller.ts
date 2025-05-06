import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import UserConstants from './user.constant';
import UserService from './user.services';

const GetUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, UserConstants.FilterableFields);

  const options = pick(req.query, ['limit', 'page', 'sort_by', 'sort_order']);

  const result = await UserService.GetUsers(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const GetUser = catchAsync(async (req, res) => {
  const userId = req.params.id;

  const result = await UserService.GetUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const DeleteUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  await UserService.DeleteUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
  });
});

const UserController = { GetUsers, GetUser, DeleteUser };

export default UserController;

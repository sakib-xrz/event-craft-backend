import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import AdminService from './admin.services';
import { EventFilterableFields, UserFilterableFields } from './admin.constant';

const GetAllUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, UserFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sort_by', 'sort_order']);

  const result = await AdminService.GetAllUsers(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const DeleteUser = catchAsync(async (req, res) => {
  const userId = req.params.id;

  const result = await AdminService.DeleteUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const GetAllEvents = catchAsync(async (req, res) => {
  const filters = pick(req.query, EventFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sort_by', 'sort_order']);

  const result = await AdminService.GetAllEvents(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Events retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const DeleteEvent = catchAsync(async (req, res) => {
  const eventId = req.params.id;

  const result = await AdminService.DeleteEvent(eventId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event deleted successfully',
    data: result,
  });
});

const AdminController = {
  GetAllUsers,
  DeleteUser,
  GetAllEvents,
  DeleteEvent,
};

export default AdminController;

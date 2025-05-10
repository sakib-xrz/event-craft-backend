import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../utils/pick';
import EventService from './event.services';
import EventConstants from './event.constant';

const CreateEvent = catchAsync(async (req, res) => {
  const eventData = req.body;
  const user = req.user;
  const result = await EventService.CreateEvent(eventData, user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Event created successfully',
    data: result,
  });
});

const CreateEvents = catchAsync(async (req, res) => {
  const eventsData = req.body;
  const user = req.user;
  const result = await EventService.CreateEvents(eventsData, user);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Events created successfully',
    data: result,
  });
});

const GetEvents = catchAsync(async (req, res) => {
  const filters = pick(req.query, EventConstants.FilterableFields);

  const options = pick(req.query, ['limit', 'page', 'sort_by', 'sort_order']);

  const result = await EventService.GetEvents(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Events retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const GetEvent = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const result = await EventService.GetEvent(eventId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event retrieved successfully',
    data: result,
  });
});

const GetFeaturedEvent = catchAsync(async (req, res) => {
  const result = await EventService.GetFeaturedEvent();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Featured event retrieved successfully',
    data: result,
  });
});

const UpdateEvent = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const eventData = req.body;
  const user = req.user;

  const result = await EventService.UpdateEvent(eventId, eventData, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event updated successfully',
    data: result,
  });
});

const DeleteEvent = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const user = req.user;

  await EventService.DeleteEvent(eventId, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event deleted successfully',
  });
});

const UpdateStatus = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const status = req.body.status;
  const user = req.user;
  const result = await EventService.UpdateStatus(eventId, status, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event status updated successfully',
    data: result,
  });
});

const JoinEvent = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const user = req.user;
  const result = await EventService.JoinEvent(eventId, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Event joined successfully',
    data: result,
  });
});

const GetParticipants = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const result = await EventService.GetParticipants(eventId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Participants retrieved successfully',
    data: result,
  });
});

const SubmitReview = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const reviewData = req.body;
  const user = req.user;

  const result = await EventService.SubmitReview(eventId, reviewData, user);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const GetReviews = catchAsync(async (req, res) => {
  const eventId = req.params.id;

  const result = await EventService.GetReviews(eventId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const EventController = {
  CreateEvent,
  CreateEvents,
  GetEvents,
  GetEvent,
  GetFeaturedEvent,
  UpdateEvent,
  DeleteEvent,
  UpdateStatus,
  JoinEvent,
  GetParticipants,
  SubmitReview,
  GetReviews,
};

export default EventController;

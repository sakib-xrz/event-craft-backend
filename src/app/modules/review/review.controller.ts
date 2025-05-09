import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ReviewService from './review.services';

const UpdateReview = catchAsync(async (req, res) => {
  const reviewId = req.params.id;
  const updateData = req.body;
  const user = req.user;

  const result = await ReviewService.UpdateReview(reviewId, updateData, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const DeleteReview = catchAsync(async (req, res) => {
  const reviewId = req.params.id;
  const user = req.user;

  await ReviewService.DeleteReview(reviewId, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
  });
});

const ReviewController = {
  UpdateReview,
  DeleteReview,
};

export default ReviewController;

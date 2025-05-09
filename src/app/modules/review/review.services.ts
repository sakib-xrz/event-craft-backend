import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import { EventStatus, Review, Role } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

const UpdateReview = async (
  reviewId: string,
  payload: Partial<Review>,
  user: JwtPayload,
) => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      event: true,
    },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  // Check if user is the review owner
  if (review.user_id !== user.id && user.role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to update this review',
    );
  }

  // Check review window (within 7 days of event completion)
  if (review.event.status === EventStatus.COMPLETED) {
    const eventDate = new Date(review.event.date_time);
    const currentDate = new Date();
    const daysDifference =
      (currentDate.getTime() - eventDate.getTime()) / (1000 * 3600 * 24);

    if (daysDifference > 7 && user.role !== Role.ADMIN) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Review can only be updated within 7 days of event completion',
      );
    }
  }

  // Update review
  const result = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  return result;
};

const DeleteReview = async (reviewId: string, user: JwtPayload) => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }

  // Check if user is the review owner or admin
  if (review.user_id !== user.id && user.role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to delete this review',
    );
  }

  // Delete review
  await prisma.review.delete({
    where: { id: reviewId },
  });
};

const ReviewService = {
  UpdateReview,
  DeleteReview,
};

export default ReviewService;

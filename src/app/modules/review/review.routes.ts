import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import ReviewController from './review.controller';

const router = express.Router();

router
  .route('/:id')
  .put(auth(Role.USER), ReviewController.UpdateReview)
  .delete(auth(Role.USER), ReviewController.DeleteReview);

export const ReviewRoutes = router;

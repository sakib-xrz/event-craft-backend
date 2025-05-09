import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import EventController from './event.controller';

const router = express.Router();

router
  .route('/')
  .post(auth(Role.USER, Role.ADMIN), EventController.CreateEvent)
  .get(EventController.GetEvents);

router
  .route('/:id')
  .get(EventController.GetEvent)
  .patch(auth(Role.USER, Role.ADMIN), EventController.UpdateEvent)
  .delete(auth(Role.USER, Role.ADMIN), EventController.DeleteEvent);

router
  .route('/:id/status')
  .patch(auth(Role.USER, Role.ADMIN), EventController.UpdateStatus);

router.post('/:id/join', auth(Role.USER), EventController.JoinEvent);

router.get(
  '/:id/participants',
  auth(Role.USER, Role.ADMIN),
  EventController.GetParticipants,
);

router
  .route('/:id/reviews')
  .get(auth(Role.USER), EventController.GetReviews)
  .post(auth(Role.USER), EventController.SubmitReview);

export const EventRoutes = router;

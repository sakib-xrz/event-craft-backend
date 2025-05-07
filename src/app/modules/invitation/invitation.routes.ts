import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import InvitationController from './invitation.controller';

const router = express.Router();

router.post('/', auth(Role.USER), InvitationController.SendInvitation);

router.get(
  '/received',
  auth(Role.USER),
  InvitationController.GetReceivedInvitations,
);

router.get('/sent', auth(Role.USER), InvitationController.GetSentInvitations);

router.patch(
  '/:id/accept',
  auth(Role.USER),
  InvitationController.AcceptInvitation,
);

router.patch(
  '/:id/decline',
  auth(Role.USER),
  InvitationController.DeclineInvitation,
);

export const InvitationRoutes = router;

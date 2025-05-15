import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import ParticipantController from './participant.controller';

const router = express.Router();

router.get(
  '/:token',
  auth(Role.ADMIN, Role.USER),
  ParticipantController.GetParticipantByToken,
);

router.patch(
  '/:id/approve',
  auth(Role.ADMIN, Role.USER),
  ParticipantController.ApproveParticipant,
);

router.patch(
  '/:id/reject',
  auth(Role.ADMIN, Role.USER),
  ParticipantController.RejectParticipant,
);

router.patch(
  '/:id/ban',
  auth(Role.ADMIN, Role.USER),
  ParticipantController.BanParticipant,
);

export const ParticipantRoutes = router;

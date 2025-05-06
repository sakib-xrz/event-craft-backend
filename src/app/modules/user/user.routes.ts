import express from 'express';
import UserController from './user.controller';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.get('/', auth(Role.ADMIN), UserController.GetUsers);

router
  .route('/:id')
  .get(auth(Role.ADMIN), UserController.GetUser)
  .delete(auth(Role.ADMIN), UserController.DeleteUser);

export const UserRoutes = router;

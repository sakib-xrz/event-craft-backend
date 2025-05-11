import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import PaymentController from './payment.controller';

const router = express.Router();

router.post('/intent', auth(Role.USER), PaymentController.CreatePaymentIntent);

router.post('/ipn_listener', PaymentController.VerifyPayment);

export const PaymentRoutes = router;

import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { EventRoutes } from '../modules/event/event.routes';
import { ParticipantRoutes } from '../modules/participant/participant.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { InvitationRoutes } from '../modules/invitation/invitation.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';

const router = express.Router();

type Route = {
  path: string;
  route: express.Router;
};

const routes: Route[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/events',
    route: EventRoutes,
  },
  {
    path: '/participants',
    route: ParticipantRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/invitations',
    route: InvitationRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

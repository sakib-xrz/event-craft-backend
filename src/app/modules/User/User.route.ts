import express from 'express';
import UserController from './UserController';
 
const router = express.Router();

router.get('/users', UserController.getAllUsers);
router.get('/users/:email', UserController.getUserByEmail);

export const UserRoutes = router;

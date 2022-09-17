import express from 'express';
import {
	deleteUser,
	getAllUsers,
	getUser,
	updateUser,
	followUser,
	unfollowUser
} from '../controllers/userController.js';
import authMiddleware from '../middleWare/authMiddleware.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

router.put('/:id/follow', authMiddleware, followUser);
router.put('/:id/unfollow', authMiddleware, unfollowUser);

export default router;

import UserModel from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Get All Users
export const getAllUsers = async (req, res) => {
	try {
		let users = await UserModel.find();
		users = users.map((user) => {
			// To get the user data with neither its password nor its hashed password
			const { password, ...otherDetails } = user._doc;
			return otherDetails;
		});
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get User
export const getUser = async (req, res) => {
	const id = req.params.id;
	try {
		const user = await UserModel.findById(id);
		if (user) {
			const { password, ...otherDetails } = user._doc;
			res.status(200).json(otherDetails);
		} else {
			res.status(404).json('Such user does not exist');
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Update User
export const updateUser = async (req, res) => {
	const id = req.params.id;
	const { _id, currentUserAdminStatus, password } = req.body;
	if (id === _id.toString() || currentUserAdminStatus) {
		try {
			if (password) {
				const salt = await bcrypt.genSalt(10);
				req.body.password = await bcrypt.hash(password, salt);
			}
			const user = await UserModel.findByIdAndUpdate(id, req.body, {
				new: true
			});
			const token = jwt.sign(
				{
					username: user.username,
					id: user._id
				},
				process.env.JWT_KEY,
				{ expiresIn: '10h' }
			);
			res.status(200).json({ user, token });
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	} else {
		res.status(403).json('Access Denied! You can only update your own profile');
	}
};

// Delete User
export const deleteUser = async (req, res) => {
	const id = req.params.id;
	const { currentUserId, currentUserAdminStatus } = req.body;

	if (id === currentUserId || currentUserAdminStatus) {
		try {
			await UserModel.findByIdAndDelete(id);
			res.status(200).json('User deleted successfully');
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	} else {
		res.status(403).json('Access Denied! You can only delete your own profile');
	}
};

// Follow a User
export const followUser = async (req, res) => {
	const id = req.params.id;
	const { _id } = req.body;
	if (_id == id) {
		res.status(403).json('Action Forbidden');
	} else {
		try {
			const followUser = await UserModel.findById(id);
			const followingUser = await UserModel.findById(_id);

			if (!followUser.followers.includes(_id)) {
				await followUser.updateOne({ $push: { followers: _id } });
				await followingUser.updateOne({ $push: { following: id } });
				res.status(200).json('User followed!');
			} else {
				res.status(403).json('you are already following this id');
			}
		} catch (error) {
			res.status(500).json(error.message);
		}
	}
};

// Unfollow User
export const unfollowUser = async (req, res) => {
	const id = req.params.id;
	const { _id } = req.body;

	if (_id === id) {
		res.status(403).json('Action Forbidden');
	} else {
		try {
			const unFollowUser = await UserModel.findById(id);
			const unFollowingUser = await UserModel.findById(_id);

			if (unFollowUser.followers.includes(_id)) {
				await unFollowUser.updateOne({ $pull: { followers: _id } });
				await unFollowingUser.updateOne({ $pull: { following: id } });
				res.status(200).json('Unfollowed Successfully!');
			} else {
				res.status(403).json('You are not following this User');
			}
		} catch (error) {
			res.status(500).json(error);
		}
	}
};

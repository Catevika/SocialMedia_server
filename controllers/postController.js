import mongoose from 'mongoose';
import PostModel from '../models/PostModel.js';
import UserModel from '../models/UserModel.js';

// Create Post
export const createPost = async (req, res) => {
	const newPost = new PostModel(req.body);
	try {
		await newPost.save();
		res.status(200).json(newPost);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get Post
export const getPost = async (req, res) => {
	const id = req.params.id;

	try {
		const post = await PostModel.findById(id);
		if (post) {
			res.status(200).json(post);
		} else {
			res.status(404).json('Such post does not exist');
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Update Post
export const updatePost = async (req, res) => {
	const postId = req.params.id;
	const { userId } = req.body;

	try {
		const post = await PostModel.findById(postId);
		if (!post) {
			res.status(404).json('Such post does not exist');
		}
		if (post.userId === userId) {
			await post.updateOne({ $set: req.body });
			res.status(200).json('Post updated successfully');
		} else {
			res.status(403).json('Access Denied! You can only update your own post');
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Delete Post
export const deletePost = async (req, res) => {
	const postId = req.params.id;
	const { userId } = req.body;

	try {
		const post = await PostModel.findById(postId);
		if (!post) {
			res.status(404).json('Such post does not exist');
		}
		if (post.userId === userId) {
			await PostModel.deleteOne();
			res.status(200).json('Post deleted successfully');
		} else {
			res.status(403).json('Access Denied! You can only delete your own post');
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Like / dislike Post
export const likePost = async (req, res) => {
	const id = req.params.id;
	const { userId } = req.body;
	try {
		const post = await PostModel.findById(id);
		if (!post.likes.includes(userId)) {
			await post.updateOne({ $push: { likes: userId } });
			res.status(200).json({ 'Post liked': post });
		} else {
			await post.updateOne({ $pull: { likes: userId } });
			res.status(200).json({ 'Post disliked': post });
		}
	} catch (error) {
		res.status(500).json(error.message);
	}
};

/* Get timeline Posts
** To get all the posts from the user and thoses from the users he is following
** $match - Step 1: transform the Post userId into an readable database OjectId and match with the existing
User ones
** $lookup - Step 2: make the query on the UserModel to get results among the PostModel data with the same userId
** from: - PostModel posts data
** localField -  UserModel following data
** foreignField - matching field between UserModel and PostModel data
** as - results = matched posts inside PostModel
** $project - Step 3: result of the aggregation
*/

// Get timeline posts
export const getTimelinePosts = async (req, res) => {
	const userId = req.params.id;
	try {
		const currentUserPosts = await PostModel.find({ userId: userId });

		const followingPosts = await UserModel.aggregate([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(userId)
				}
			},
			{
				$lookup: {
					from: 'posts',
					localField: 'following',
					foreignField: 'userId',
					as: 'followingPosts'
				}
			},
			{
				$project: {
					followingPosts: 1,
					_id: 0
				}
			}
		]);

		/* Concat(followingPosts) does not work well because it gives  the user posts separated from the
		 ** followingPosts. Whith the tip below, all the posts are now at the same level
		 ** sort(a, b) - Latest posts will be displayed first
		 */

		res.status(200).json(
			currentUserPosts
				.concat(...followingPosts[0].followingPosts)
				.sort((a, b) => {
					return new Date(b.createdAt) - new Date(a.createdAt);
				})
		);
	} catch (error) {
		res.status(500).json(error.message);
	}
};

import mongoose from 'mongoose';

const PostSchema = mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		},
		desc: String,
		likes: [],
		image: String
	},
	{ timestamps: true }
);

const PostModel = mongoose.model('Posts', PostSchema);

export default PostModel;

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Routes
import AuthRoute from './routes/AuthRoute.js';
import UserRoute from './routes/UserRoute.js';
import PostRoute from './routes/PostRoute.js';
import UploadRoute from './routes/UploadRoute.js';
import ChatRoute from './routes/ChatRoute.js';
import MessageRoute from './routes/MessageRoute.js';

const app = express();

// To serve images to public
app.use(express.static('public'));
app.use('/images', express.static('images'));

// Middlewares
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

dotenv.config();

mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(console.log('\x1b[33m', 'MongoDB connected successfully'))
	.then(
		app.listen(process.env.PORT),
		console.log('\x1b[33m', `Listening on Port: ${process.env.PORT}`)
	)
	.catch((error) => console.log(`${error} did not connect`));

// Usage of Routes
app.use('/chat', ChatRoute);
app.use('/auth', AuthRoute);
app.use('/user', UserRoute);
app.use('/post', PostRoute);
app.use('/upload', UploadRoute);
app.use('/message', MessageRoute);

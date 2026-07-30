import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routers/users.router.js';
import postRouter from './routers/posts.router.js';
import repostRouter from './routers/reposts.router.ts';
import bookmarksRouter from './routers/bookmarks.router.ts';
import followsRouter from './routers/follows.router.js';
import feedRouter from './routers/feed.router.js';
import exploreRouter from './routers/explore.router.js';
import hashtagsRouter from './routers/hashtags.router.js';
import likesRouter from './routers/likes.router.js';
import settingsRouter from './routers/settings.router.ts';
import messagesRouter from './routers/messages.router.js';
import notificationsRouter from './routers/notifications.router.ts';
import { errorHandler } from './middlewares/errorHandler.js';
import { noCache } from './middlewares/noCache.ts';

const app = express();
app.set('etag', false);

const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL || typeof FRONTEND_URL !== 'string') {
  throw new Error('FRONTEND_URL env not set');
}
app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
  }),
);

app.all('/api/auth/*splat', noCache, toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mount BetterAuth

app.get('/', (req, res) => {
  res.send('Hello World TSX!');
});

app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/follow', followsRouter);
app.use('/api/likes', likesRouter);
app.use('/api/feed', feedRouter);
app.use('/api/explore', exploreRouter);
app.use('/api/hashtags', hashtagsRouter);
app.use('/api/repost', repostRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationsRouter);

app.use(errorHandler);

const port = process.env.PORT || 8000;
app.listen(port, (err) => {
  if (err) {
    console.error(`ERROR :: ${err}`);
    return;
  }

  console.log(`Server running on port ${port}`);
});

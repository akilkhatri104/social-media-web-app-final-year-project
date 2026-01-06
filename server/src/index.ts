import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routers/users.router.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());

// mount BetterAuth
app.all('api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World TSX!');
});

app.use('/api/user', userRouter);

app.use(errorHandler);

const port = process.env.PORT || 8000;
app.listen(port, (err) => {
  if (err) {
    console.error(`ERROR :: ${err}`);
    return;
  }

  console.log(`Server running on port ${port}`);
});

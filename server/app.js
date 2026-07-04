import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './config/cors.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Quizee API is running');
});

// routes will be mounted here as you build them
import authRoutes from './routes/authRoutes.js';

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

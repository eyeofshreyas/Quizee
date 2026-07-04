const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { corsOptions } = require('./config/cors.js');
const { errorHandler, notFound } = require('./middleware/errorMiddleware.js');
const authRoutes = require('./routes/authRoutes.js');
const quizRoutes = require('./routes/quizRoutes.js');
const progressRoutes = require('./routes/progressRoutes.js');
const leaderboardRoutes = require('./routes/leaderboardRoutes.js');
const badgeRoutes = require('./routes/badgeRoutes.js');


const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Quizee API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
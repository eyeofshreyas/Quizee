const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { corsOptions } = require('./config/cors.js');
const { errorHandler, notFound } = require('./middleware/errorMiddleware.js');
const authRoutes = require('./routes/authRoutes.js');

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Quizee API is running');
});

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
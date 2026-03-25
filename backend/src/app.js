const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFoundHandler } = require('./helpers/errorHandlers');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
  }),
);
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    message: 'Eventful backend is running',
  });
});

app.use('/api/auth', authRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };

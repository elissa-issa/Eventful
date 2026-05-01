const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const customizedPlanRoutes = require('./routes/customizedPlanRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const orderRoutes = require('./routes/orderRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const savedLocationRoutes = require('./routes/savedLocationRoutes');
const contactMessageRoutes = require('./routes/contactMessageRoutes');
const { errorHandler, notFoundHandler } = require('./helpers/errorHandlers');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
  }),
);
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    message: 'Eventful backend is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/customized-plans', customizedPlanRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/locations', savedLocationRoutes);
app.use('/api/contact-messages', contactMessageRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };

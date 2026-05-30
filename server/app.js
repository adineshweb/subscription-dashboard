const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const userRoutes = require('./routes/userRoutes');
const adminController = require('./controllers/adminController');
const subscriptionController = require('./controllers/subscriptionController');
const { authenticateUser, authorizeRoles } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/user/profile', userRoutes);

app.post('/api/subscribe/order/:planId', authenticateUser, subscriptionController.createOrder);
app.post('/api/subscribe/:planId', authenticateUser, subscriptionController.verifyPayment);
app.get('/api/my-subscription', authenticateUser, subscriptionController.getMySubscription);
app.get('/api/admin/subscriptions', authenticateUser, authorizeRoles('admin'), adminController.getSubscriptions);

app.get('/', (req, res) => {
  res.json({ message: 'Subscription Management Dashboard API is running.' });
});

app.use(errorHandler);

module.exports = app;

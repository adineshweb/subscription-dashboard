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

const defaultOrigins = [
  'http://localhost:5173',
  'https://subscription-dashboard-orpin.vercel.app',
  'https://subscription-dashboard-git-main-dineshs-projects-dea0080c.vercel.app'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : defaultOrigins;

// Merge arrays and filter duplicates to guarantee defaults are always accessible
const finalAllowedOrigins = [...new Set([...allowedOrigins, ...defaultOrigins])];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = finalAllowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === origin || allowedOrigin === '*') return true;
      // Allow Vercel preview domains dynamically
      if (
        origin.includes('vercel.app') && 
        origin.includes('subscription-dashboard')
      ) {
        return true;
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS Blocked: ${origin}`);
      callback(null, false); // Safe fallback (no Express crash)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
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

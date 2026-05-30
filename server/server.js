const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = require('./app');
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Database connection failed. Server was not started.', error.message);
  process.exit(1);
});

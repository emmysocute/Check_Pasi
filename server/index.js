require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./config/db'); // Initialize database connection and migrations

const app = express();

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Requests without an Origin header (for example, server-to-server calls) are allowed.
    callback(null, !origin || allowedOrigins.includes(origin));
  },
  credentials: true
}));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/tax', require('./routes/tax'));
app.use('/api/monthly-tracker', require('./routes/monthlyTracker'));

const PORT = process.env.PORT || 3001;

app.listen(PORT,'0.0.0.0',() => {
  console.log(`Server is running on port ${PORT}`);
});

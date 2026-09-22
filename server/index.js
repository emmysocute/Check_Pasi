require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Import database connection

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  console.log('Body:', req.body);
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

const PORT = process.env.PORT || 3001;

app.listen(PORT,'0.0.0.0',() => {
  console.log(`Server is running on port ${PORT}`);
});

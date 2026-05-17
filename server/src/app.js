const express = require('express');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

app.use(express.json());

// Public auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/user', userRoutes);

module.exports = app;
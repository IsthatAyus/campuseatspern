const express = require('express');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const canteenRoutes = require('./routes/canteen');
const menuRoutes = require('./routes/menu');

const app = express();

app.use(express.json());

// Public auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/user', userRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Canteen routes
app.use('/api/canteen', canteenRoutes);

// Menu routes
app.use('/api/menu', menuRoutes);

module.exports = app;

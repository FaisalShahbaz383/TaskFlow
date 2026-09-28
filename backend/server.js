const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://faisalshahbaz383_db_user:<5tPjQ3PXvXAiEfpP>@cluster0.9r9czme.mongodb.net/?appName=Cluster0';

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (Development friendly)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.send({
    message: 'Task Dashboard API is running',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks',
      health: '/api/health',
    },
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
  });
});

// Database Connection & Server Initialization
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(` Connected to MongoDB successfully at: ${MONGODB_URI}`);

    app.listen(PORT, () => {
      console.log(` Server is running on port ${PORT}`);
      console.log(` API URL: http://localhost:${PORT}/api/tasks`);
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️ Starting HTTP server without MongoDB connection (fallback mode)...');
    
    // Still start server to let developers diagnose connection or use health endpoints
    app.listen(PORT, () => {
      console.log(`⚠️ Server running with DB error on port ${PORT}`);
    });
  }
};

startServer();

module.exports = app;

// Global error handlers - These MUST be the very first lines of code
process.on('uncaughtException', (error) => {
  console.error('GLOBAL UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error Name:', error.name);
  console.error('Error Message:', error.message);
  console.error('Error Stack:', error.stack);
  process.exit(1); // Mandatory exit
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('GLOBAL UNHANDLED REJECTION! Shutting down due to unhandled rejection.');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  // If 'reason' is an Error object, log its stack too
  if (reason instanceof Error) {
    console.error('Reason Stack:', reason.stack);
  }
  process.exit(1); // Exit on unhandled rejection to make it visible
});

const express = require('express');
const db = require('./db'); // Import the database configuration
const authRoutes = require('./routes/auth'); // Import auth routes
const fileUploadRoutes = require('./routes/fileUpload'); // Import file upload routes
const authenticateToken = require('./middleware/authMiddleware'); // Import the middleware

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json()); 

// Mount auth routes
app.use('/api/auth', authRoutes); 
// Mount file upload routes (e.g., /api/upload)
app.use('/api', fileUploadRoutes); 

// Example of a protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  // req.user is available here, added by authenticateToken middleware
  res.json({ 
    message: 'This is a protected route.', 
    user: req.user 
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AI Audio Filter API!' });
});

// API status endpoint
app.get('/api/status', async (req, res) => {
  console.log('Attempting to query database for /api/status...'); // Added log
  try {
    await db.query('SELECT NOW()'); // Simple query to check DB connection
    console.log('Database query successful for /api/status.'); // Added log
    res.json({ 
      backend: 'Backend is running',  // Changed from status to backend
      timestamp: new Date().toISOString(),
      database: 'Connected'           // Changed from dbStatus to database
    });
  } catch (err) {
    console.error('Database connection error during /api/status:', err);
    console.error('Error stack for /api/status DB error:', err.stack); // Added stack log
    res.status(500).json({ 
      backend: 'Backend is running',  // Changed from status to backend
      timestamp: new Date().toISOString(),
      database: 'Error connecting to database', // Changed from dbStatus to database
      error: err.message,
      errorStack: err.stack // Optionally send stack in response for debugging
    });
  }
});

const server = app.listen(port, () => { // Assign app.listen to 'server'
  console.log(`Backend server listening at http://localhost:${port}`);
});

// Add server error handler (e.g., for EADDRINUSE)
server.on('error', (error) => {
  console.error('SERVER ERROR:');
  if (error.syscall !== 'listen') {
    console.error('Error is not a listen error:', error);
    process.exit(1); // Exit for unexpected server errors not related to listen
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      console.error('An unexpected error occurred during server startup:', error);
      process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    // Close database connections
    // Assuming db.js exports getPool() which returns the pg.Pool instance
    db.getPool().end()
      .then(() => {
        console.log('Database pool closed.');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error closing database pool:', err);
        process.exit(1);
      });
  });

  // If server hasn't finished in a reasonable time, force exit
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Catches Ctrl+C

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET; 

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    console.log('Auth middleware: No token provided.');
    return res.status(401).json({ message: 'Access denied. No token provided.'});
  }

  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not defined in authMiddleware. Make sure it is set in the .env file and the server was restarted.');
    return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification failed:', err.name, '-', err.message);
      return res.status(403).json({ message: 'Invalid token.', errorName: err.name }); 
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;

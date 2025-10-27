const jwt = require('jsonwebtoken');

// Use SAME JWT secret as auth routes!
const JWT_SECRET = process.env.JWT_SECRET || 'clover-inventory-pro-secret-key-2024';

console.log('Auth middleware initialized with JWT_SECRET');

const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log(`[${req.method}] ${req.path} - Token present: ${!!token}`);

  // If no token, check if this is a public route
  if (!token) {
    // Allow login and register without token
    if (req.path === '/auth/login' || req.path === '/auth/register') {
      return next();
    }
    console.log(`❌ No token for ${req.path}`);
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify token with SAME secret
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error(`❌ Token verification error for ${req.path}:`, err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log(`✅ Token verified for user ${user.email}`);
    req.user = user;
    next();
  });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = { authenticateToken, authorize, JWT_SECRET };

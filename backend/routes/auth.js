const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database/inventory.db'));

// Use consistent JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'clover-inventory-pro-secret-key-2024';

console.log('Auth routes initialized');

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Login - PUBLIC
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Login successful for ${email}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register - PUBLIC
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    const result = db.prepare(
      'INSERT INTO users (email, password, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(email, hashedPassword, name, 'user', now, now);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Registration successful for ${email}`);

    res.json({
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        name,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user - PROTECTED with inline middleware
router.get('/me', verifyToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ User info retrieved for ${user.email}`);

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const db = new Database(path.join(__dirname, '../../database/inventory.db'));

router.get('/', authenticateToken, (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT a.*, p.name as product_name, l.name as location_name
      FROM alerts a
      LEFT JOIN products p ON a.product_id = p.id
      LEFT JOIN locations l ON a.location_id = l.id
      WHERE a.is_resolved = 0
      ORDER BY a.created_at DESC
    `).all();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

module.exports = router;

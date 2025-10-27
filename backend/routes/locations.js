const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const { authenticateToken, authorize } = require('../middleware/auth');
const db = new Database(path.join(__dirname, '../../database/inventory.db'));

router.get('/', authenticateToken, (req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM locations WHERE is_active = 1 ORDER BY name').all();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

router.post('/', authenticateToken, authorize('admin'), (req, res) => {
  try {
    const { name, address, city, state, zipCode, phone, email } = req.body;
    const locationId = uuidv4();
    db.prepare(`INSERT INTO locations (id, name, address, city, state, zip_code, phone, email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(locationId, name, address, city, state, zipCode, phone, email);
    res.status(201).json({ message: 'Location created', locationId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create location' });
  }
});

module.exports = router;

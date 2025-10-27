const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const { authenticateToken, authorize } = require('../middleware/auth');
const db = new Database(path.join(__dirname, '../../database/inventory.db'));

router.get('/', authenticateToken, (req, res) => {
  try {
    const suppliers = db.prepare('SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name').all();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get suppliers' });
  }
});

router.post('/', authenticateToken, authorize('admin', 'manager'), (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, paymentTerms } = req.body;
    const supplierId = uuidv4();
    db.prepare(`INSERT INTO suppliers (id, name, contact_person, email, phone, address, payment_terms)
                VALUES (?, ?, ?, ?, ?, ?, ?)`).run(supplierId, name, contactPerson, email, phone, address, paymentTerms);
    res.status(201).json({ message: 'Supplier created', supplierId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

module.exports = router;

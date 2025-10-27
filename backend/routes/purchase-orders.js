const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const { authenticateToken, authorize } = require('../middleware/auth');
const db = new Database(path.join(__dirname, '../../database/inventory.db'));

router.get('/', authenticateToken, (req, res) => {
  try {
    const pos = db.prepare(`
      SELECT po.*, s.name as supplier_name, l.name as location_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      JOIN locations l ON po.location_id = l.id
      ORDER BY po.created_at DESC LIMIT 100
    `).all();
    res.json(pos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get purchase orders' });
  }
});

router.post('/', authenticateToken, authorize('admin', 'manager'), (req, res) => {
  try {
    const { supplierId, locationId, items, notes } = req.body;
    const poId = uuidv4();
    const poNumber = `PO-${Date.now()}`;
    db.prepare(`INSERT INTO purchase_orders (id, po_number, supplier_id, location_id, status, notes, created_by)
                VALUES (?, ?, ?, ?, 'draft', ?, ?)`).run(poId, poNumber, supplierId, locationId, notes, req.user.id);
    items.forEach(item => {
      db.prepare(`INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity_ordered, unit_cost)
                  VALUES (?, ?, ?, ?, ?)`).run(uuidv4(), poId, item.productId, item.quantity, item.unitCost);
    });
    res.status(201).json({ message: 'Purchase order created', poId, poNumber });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

module.exports = router;

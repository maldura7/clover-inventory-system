const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const { authenticateToken, authorize } = require('../middleware/auth');

const db = new Database(path.join(__dirname, '../../database/inventory.db'));

// Get inventory with filters
router.get('/', authenticateToken, (req, res) => {
  try {
    const { locationId, lowStock } = req.query;
    
    let query = `
      SELECT i.*, p.name, p.sku, p.reorder_level, l.name as location_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN locations l ON i.location_id = l.id
      WHERE 1=1
    `;
    const params = [];
    
    if (locationId) {
      query += ` AND i.location_id = ?`;
      params.push(locationId);
    }
    
    if (lowStock === 'true') {
      query += ` AND i.quantity <= p.reorder_level`;
    }
    
    query += ` ORDER BY i.updated_at DESC`;
    
    const inventory = db.prepare(query).all(...params);
    res.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to get inventory' });
  }
});

// Adjust stock
router.post('/adjust', authenticateToken, authorize('admin', 'manager'), (req, res) => {
  try {
    const { productId, locationId, adjustmentType, quantityChange, reason, referenceNumber } = req.body;
    
    if (!productId || !locationId || !adjustmentType || quantityChange === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get current inventory
    let inventory = db.prepare('SELECT * FROM inventory WHERE product_id = ? AND location_id = ?')
      .get(productId, locationId);
    
    if (!inventory) {
      // Create new inventory record
      const inventoryId = uuidv4();
      db.prepare(`
        INSERT INTO inventory (id, product_id, location_id, quantity)
        VALUES (?, ?, ?, 0)
      `).run(inventoryId, productId, locationId);
      inventory = { id: inventoryId, quantity: 0 };
    }
    
    const quantityBefore = inventory.quantity;
    const quantityAfter = quantityBefore + quantityChange;
    
    // Update inventory
    db.prepare(`
      UPDATE inventory SET quantity = ?, updated_at = datetime('now')
      WHERE product_id = ? AND location_id = ?
    `).run(quantityAfter, productId, locationId);
    
    // Record adjustment
    db.prepare(`
      INSERT INTO stock_adjustments (
        id, product_id, location_id, adjustment_type, quantity_change,
        quantity_before, quantity_after, reason, reference_number, adjusted_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(), productId, locationId, adjustmentType, quantityChange,
      quantityBefore, quantityAfter, reason, referenceNumber, req.user.id
    );
    
    // Log audit
    db.prepare(`
      INSERT INTO audit_log (id, user_id, action, table_name, record_id, new_value, created_at)
      VALUES (?, ?, 'ADJUST_STOCK', 'inventory', ?, ?, datetime('now'))
    `).run(uuidv4(), req.user.id, inventory.id, JSON.stringify({ quantityChange, quantityAfter }));
    
    // Check for low stock alert
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (quantityAfter <= product.reorder_level) {
      db.prepare(`
        INSERT INTO alerts (id, alert_type, product_id, location_id, message, severity)
        VALUES (?, 'low_stock', ?, ?, ?, 'high')
      `).run(uuidv4(), productId, locationId, 
             `${product.name} is low on stock (${quantityAfter} units remaining)`);
    }
    
    res.json({ message: 'Stock adjusted successfully', quantityBefore, quantityAfter });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
});

// Get stock history
router.get('/history/:productId', authenticateToken, (req, res) => {
  try {
    const { productId } = req.params;
    const { locationId } = req.query;
    
    let query = `
      SELECT sa.*, u.full_name as adjusted_by_name, l.name as location_name
      FROM stock_adjustments sa
      JOIN users u ON sa.adjusted_by = u.id
      JOIN locations l ON sa.location_id = l.id
      WHERE sa.product_id = ?
    `;
    const params = [productId];
    
    if (locationId) {
      query += ` AND sa.location_id = ?`;
      params.push(locationId);
    }
    
    query += ` ORDER BY sa.created_at DESC LIMIT 100`;
    
    const history = db.prepare(query).all(...params);
    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get stock history' });
  }
});

module.exports = router;

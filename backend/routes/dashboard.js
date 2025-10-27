const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database/inventory.db'));

// Get dashboard stats - SIMPLE VERSION
router.get('/stats', (req, res) => {
  try {
    console.log('📊 Dashboard stats requested');

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count || 0;
    
    const totalValue = db.prepare(`
      SELECT COALESCE(SUM(i.quantity * p.cost_price), 0) as value
      FROM inventory i
      JOIN products p ON i.product_id = p.id
    `).get().value || 0;

    const lowStock = db.prepare(`
      SELECT COUNT(*) as count FROM inventory WHERE quantity <= 10
    `).get().count || 0;

    const stats = {
      totalProducts: totalProducts,
      totalInventoryValue: totalValue,
      lowStockProducts: lowStock,
      activeAlerts: 0,
      recentOrders: 0
    };

    console.log('✅ Stats:', stats);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Stats error:', error.message);
    res.status(500).json({
      error: 'Failed to load stats',
      totalProducts: 0,
      totalInventoryValue: 0,
      lowStockProducts: 0,
      activeAlerts: 0,
      recentOrders: 0
    });
  }
});

// Get top products
router.get('/top-products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.id, p.name, p.sku, COUNT(*) as total_sold
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      GROUP BY p.id
      LIMIT 5
    `).all() || [];

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

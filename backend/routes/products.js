const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database/inventory.db'));

// Get all products - SIMPLE VERSION
router.get('/', (req, res) => {
  try {
    console.log('📦 Fetching products...');

    // Simple query
    const products = db.prepare(`
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.category_name,
        p.cost_price,
        p.selling_price,
        p.reorder_level,
        (SELECT COALESCE(SUM(quantity), 0) FROM inventory WHERE product_id = p.id) as total_stock
      FROM products p
      ORDER BY p.id DESC
    `).all();

    console.log(`✅ Found ${products.length} products`);
    
    // Force JSON response with 200 status
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      products: products,
      count: products.length
    });
  } catch (error) {
    console.error('❌ Products error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get products',
      details: error.message
    });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', (req, res) => {
  try {
    const { sku, name, description, costPrice, sellingPrice, unitOfMeasure, reorderLevel, reorderQuantity } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const now = new Date().toISOString();

    const result = db.prepare(`
      INSERT INTO products (sku, name, description, cost_price, selling_price, unit_of_measure, reorder_level, reorder_quantity, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sku || null,
      name,
      description || '',
      costPrice || 0,
      sellingPrice || 0,
      unitOfMeasure || 'unit',
      reorderLevel || 10,
      reorderQuantity || 50,
      now,
      now
    );

    console.log(`✅ Product created: ${name}`);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Product created'
    });
  } catch (error) {
    console.error('❌ Create error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', (req, res) => {
  try {
    const { name, description, costPrice, sellingPrice } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE products SET name = ?, description = ?, cost_price = ?, selling_price = ?, updated_at = ? WHERE id = ?
    `).run(name, description, costPrice, sellingPrice, now, req.params.id);

    console.log(`✅ Product updated: ${name}`);

    res.status(200).json({ success: true, message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM inventory WHERE product_id = ?').run(req.params.id);
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(`✅ Product deleted`);

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

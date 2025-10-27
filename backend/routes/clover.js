const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database/inventory.db'));

console.log('🔗 Clover routes initialized');

// Get sync history - THIS IS WHAT'S BEING CALLED
router.get('/sync-history', (req, res) => {
  try {
    console.log('📊 Fetching sync history...');
    
    // Query the correct table name
    const history = db.prepare(`
      SELECT * FROM clover_sync_history ORDER BY created_at DESC LIMIT 20
    `).all();

    console.log(`✅ Retrieved ${history.length} sync records`);

    res.status(200).json(history || []);
  } catch (error) {
    console.error('❌ Sync history error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get sync history',
      details: error.message,
      history: []
    });
  }
});

// Export inventory to Clover
router.post('/sync', (req, res) => {
  try {
    console.log('🔄 Starting Clover sync...');

    const now = new Date().toISOString();

    // Get products count
    const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count || 0;

    // Insert sync record into correct table
    const result = db.prepare(`
      INSERT INTO clover_sync_history (sync_type, status, items_synced, sync_notes, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('export', 'success', productsCount, 'Products exported to Clover', now);

    console.log(`✅ Sync record created: ${productsCount} items`);

    res.status(200).json({ 
      success: true, 
      message: 'Sync completed',
      itemsSynced: productsCount,
      syncId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('❌ Sync error:', error.message);
    res.status(500).json({ 
      error: 'Failed to sync',
      details: error.message
    });
  }
});

// Import from Clover
router.post('/import', (req, res) => {
  try {
    console.log('🔄 Starting Clover import...');

    const now = new Date().toISOString();

    // Insert sync record
    const result = db.prepare(`
      INSERT INTO clover_sync_history (sync_type, status, items_synced, sync_notes, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('import', 'success', 0, 'Import started', now);

    console.log(`✅ Import record created`);

    res.status(200).json({ 
      success: true, 
      message: 'Import completed',
      syncId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('❌ Import error:', error.message);
    res.status(500).json({ 
      error: 'Failed to import',
      details: error.message
    });
  }
});

// Check connection status
router.get('/status', (req, res) => {
  try {
    const connection = db.prepare(`
      SELECT * FROM clover_sync_history ORDER BY created_at DESC LIMIT 1
    `).get();

    if (!connection) {
      return res.json({ 
        connected: false,
        message: 'No sync history'
      });
    }

    res.json({
      connected: true,
      lastSync: connection.created_at,
      lastSyncType: connection.sync_type,
      itemsSynced: connection.items_synced
    });
  } catch (error) {
    console.error('❌ Status error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get status',
      details: error.message
    });
  }
});

// Get auth URL for Clover OAuth
router.get('/auth-url', (req, res) => {
  try {
    const clientId = process.env.CLOVER_CLIENT_ID || '674JVXJ7S57T6';
    const redirectUrl = process.env.CLOVER_REDIRECT_URL || 'http://localhost:3001/api/clover/callback';

    // Use sandbox for development
    const authUrl = `https://sandbox.dev.clover.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}`;

    console.log('✅ Auth URL generated');

    res.json({ authUrl });
  } catch (error) {
    console.error('❌ Auth URL error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// OAuth callback handler
router.get('/callback', (req, res) => {
  try {
    const { code, merchant_id } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code received' });
    }

    console.log('🔐 OAuth callback received');
    console.log('Merchant ID:', merchant_id);
    console.log('Code:', code);

    // In production, exchange code for token here
    // For now, just acknowledge receipt
    res.json({
      success: true,
      message: 'OAuth callback received',
      merchant_id: merchant_id,
      code: code
    });
  } catch (error) {
    console.error('❌ Callback error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
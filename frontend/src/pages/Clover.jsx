import React, { useState, useEffect } from 'react';
import '../styles/Clover.css';

export default function Clover() {
  const [connected, setConnected] = useState(false);
  const [syncHistory, setSyncHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchSyncHistory();
  }, []);

  const fetchSyncHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/clover/sync-history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setSyncHistory(data || []);
      setConnected(true);
    } catch (err) {
      console.error('Clover error:', err);
      setError('Clover not connected yet or error loading sync history');
      setConnected(false);
      setSyncHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3001/api/clover/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      alert('Sync started! Check back in a moment.');
      setTimeout(fetchSyncHistory, 2000);
    } catch (err) {
      alert(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = () => {
    alert('Clover OAuth setup will open in a new window.');
  };

  return (
    <div className="clover-page">
      <h1>🔗 Clover POS Integration</h1>

      <div className="clover-card">
        <div className="connection-status">
          <div className={`status-badge ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '✓ Connected' : '✗ Not Connected'}
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {!connected ? (
          <div className="setup-section">
            <h2>Connect to Clover</h2>
            <p>Connect your Clover account to sync inventory and orders.</p>
            <button className="btn btn-primary btn-lg" onClick={handleConnect}>
              🔐 Connect Clover Account
            </button>
            <div className="setup-info">
              <h3>What this does:</h3>
              <ul>
                <li>Sync your inventory to Clover POS</li>
                <li>Automatically update stock when sales occur</li>
                <li>Manage products and categories</li>
                <li>Track orders and inventory in real-time</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="sync-section">
            <h2>Sync Management</h2>

            <div className="sync-controls">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
              </button>
              <p>Last sync: {syncHistory[0]?.created_at ? new Date(syncHistory[0].created_at).toLocaleString() : 'Never'}</p>
            </div>

            {loading ? (
              <div className="loading">Loading sync history...</div>
            ) : syncHistory.length > 0 ? (
              <>
                <h3>Sync History</h3>
                <table className="sync-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Items</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncHistory.slice(0, 10).map((sync, idx) => (
                      <tr key={idx}>
                        <td>{new Date(sync.created_at).toLocaleString()}</td>
                        <td>{sync.sync_type || 'Full'}</td>
                        <td>
                          <span className={`status-badge ${sync.status === 'success' ? 'success' : 'error'}`}>
                            {sync.status}
                          </span>
                        </td>
                        <td>{sync.items_synced || 0}</td>
                        <td>{sync.sync_notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p>No sync history yet</p>
            )}
          </div>
        )}
      </div>

      <div className="clover-info">
        <h2>📚 Integration Details</h2>
        <div className="info-box">
          <h3>Features:</h3>
          <ul>
            <li>✅ OAuth 2.0 Authentication</li>
            <li>✅ Inventory Sync (bidirectional)</li>
            <li>✅ Sales Order Tracking</li>
            <li>✅ Product Category Mapping</li>
            <li>✅ Real-time Stock Updates</li>
            <li>✅ Automated Alerts</li>
            <li>✅ Webhook Support</li>
            <li>✅ Rate Limiting</li>
          </ul>
        </div>

        <div className="info-box">
          <h3>API Status:</h3>
          <ul>
            <li>Base URL: https://api.clover.com</li>
            <li>Version: v3</li>
            <li>Auth: OAuth 2.0</li>
            <li>Status: <span className="badge-success">Available</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      const response = await fetch('http://localhost:3001/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(`Failed to load dashboard: ${err.message}`);
      // Set default stats
      setStats({
        totalProducts: 0,
        totalInventoryValue: 0,
        lowStockProducts: 0,
        activeAlerts: 0,
        recentOrders: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="stats-grid">
            {stats && (
              <>
                <div className="stat-card">
                  <h3>Total Products</h3>
                  <p className="stat-value">{stats.totalProducts || 0}</p>
                </div>

                <div className="stat-card">
                  <h3>Inventory Value</h3>
                  <p className="stat-value">${(stats.totalInventoryValue || 0).toFixed(2)}</p>
                </div>

                <div className="stat-card">
                  <h3>Low Stock Items</h3>
                  <p className="stat-value warning">{stats.lowStockProducts || 0}</p>
                </div>

                <div className="stat-card">
                  <h3>Active Alerts</h3>
                  <p className="stat-value alert">{stats.activeAlerts || 0}</p>
                </div>

                <div className="stat-card">
                  <h3>Pending Orders</h3>
                  <p className="stat-value">{stats.recentOrders || 0}</p>
                </div>
              </>
            )}
          </div>

          <button className="refresh-btn" onClick={fetchDashboardData}>
            🔄 Refresh
          </button>
        </>
      )}
    </div>
  );
}

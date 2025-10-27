import React, { useState, useEffect } from 'react';
import '../styles/Inventory.css';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    adjustmentType: 'manual',
    quantityChange: '',
    reason: '',
    referenceNumber: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setInventory(data || []);
    } catch (err) {
      console.error('Inventory error:', err);
      setError(`Failed to load inventory: ${err.message}`);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setAdjustmentData({
      adjustmentType: 'manual',
      quantityChange: '',
      reason: '',
      referenceNumber: '',
    });
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustmentData.quantityChange) {
      alert('Please enter quantity change');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedItem.product_id,
          locationId: selectedItem.location_id,
          ...adjustmentData,
          quantityChange: parseInt(adjustmentData.quantityChange),
        })
      });

      if (!response.ok) {
        throw new Error('Failed to adjust stock');
      }

      alert('Stock adjusted successfully!');
      setShowAdjustModal(false);
      fetchInventory();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getLowStockItems = () => {
    return inventory.filter((item) => item.quantity <= (item.reorder_level || 10));
  };

  const getTotalValue = () => {
    return inventory.reduce(
      (total, item) => total + (item.quantity * (item.cost_price || 0)),
      0
    );
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>📦 Inventory Management</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="inventory-stats">
        <div className="stat-box">
          <h3>Total Items</h3>
          <p>{inventory.length}</p>
        </div>
        <div className="stat-box warning">
          <h3>Low Stock</h3>
          <p>{getLowStockItems().length}</p>
        </div>
        <div className="stat-box">
          <h3>Total Value</h3>
          <p>${getTotalValue().toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading inventory...</div>
      ) : inventory.length > 0 ? (
        <div className="inventory-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Location</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={`${item.product_id}-${item.location_id}`} className={item.quantity <= item.reorder_level ? 'low-stock' : ''}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.location_name}</td>
                  <td>
                    <strong className={item.quantity <= item.reorder_level ? 'text-danger' : ''}>
                      {item.quantity}
                    </strong>
                  </td>
                  <td>{item.reorder_level}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => openAdjustModal(item)}
                    >
                      ⚙️ Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No inventory items yet. Add products first.</p>
        </div>
      )}

      {showAdjustModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adjust Stock</h2>
              <button className="close-btn" onClick={() => setShowAdjustModal(false)}>×</button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="modal-body">
              <p className="current-stock">
                Current Stock: <strong>{selectedItem.quantity}</strong> units
              </p>

              <div className="form-group">
                <label>Adjustment Type</label>
                <select
                  value={adjustmentData.adjustmentType}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, adjustmentType: e.target.value })}
                >
                  <option value="sale">Sale</option>
                  <option value="return">Return</option>
                  <option value="damaged">Damaged</option>
                  <option value="manual">Manual Adjustment</option>
                  <option value="received">Received</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity Change</label>
                <input
                  type="number"
                  placeholder="e.g., -1 for sale, +5 for receive"
                  value={adjustmentData.quantityChange}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, quantityChange: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  placeholder="Reason for adjustment"
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Apply Adjustment
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAdjustModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

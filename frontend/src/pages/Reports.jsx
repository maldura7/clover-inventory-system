import React, { useState } from 'react';
import '../styles/Reports.css';

export default function Reports() {
  const [reportType, setReportType] = useState('inventory');
  const [format, setFormat] = useState('json');
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:3001/api/reports/inventory-report?format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.status}`);
      }

      // Get the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report.${format}`;
      a.click();
      
      alert('Report generated and downloaded!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="reports-page">
      <h1>📊 Reports & Analytics</h1>

      <div className="reports-grid">
        <div className="report-card">
          <h2>📦 Inventory Report</h2>
          <p>Detailed inventory levels across all locations</p>
          
          <div className="form-group">
            <label>Format:</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="json">JSON</option>
              <option value="csv">CSV (Excel)</option>
              <option value="xlsx">XLSX (Excel)</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerateReport}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '📥 Download Report'}
          </button>

          <div className="report-info">
            <h4>Includes:</h4>
            <ul>
              <li>Product SKU and Name</li>
              <li>Current Stock Levels</li>
              <li>Location Information</li>
              <li>Cost and Selling Prices</li>
              <li>Inventory Value</li>
            </ul>
          </div>
        </div>

        <div className="report-card">
          <h2>💰 Sales Report</h2>
          <p>Sales trends and revenue analysis</p>
          
          <button className="btn btn-primary" disabled>
            📥 Coming Soon
          </button>

          <div className="report-info">
            <h4>Will Include:</h4>
            <ul>
              <li>Total Sales</li>
              <li>Revenue</li>
              <li>Top Products</li>
              <li>Sales by Location</li>
              <li>Trends</li>
            </ul>
          </div>
        </div>

        <div className="report-card">
          <h2>⚠️ Stock Alert Report</h2>
          <p>Low stock and critical alerts</p>
          
          <button className="btn btn-primary" disabled>
            📥 Coming Soon
          </button>

          <div className="report-info">
            <h4>Will Include:</h4>
            <ul>
              <li>Low Stock Items</li>
              <li>Out of Stock</li>
              <li>Over Stock</li>
              <li>Recommended Orders</li>
              <li>Supplier Info</li>
            </ul>
          </div>
        </div>

        <div className="report-card">
          <h2>📈 Analytics Dashboard</h2>
          <p>Visual insights and metrics</p>
          
          <button className="btn btn-primary" disabled>
            📊 Coming Soon
          </button>

          <div className="report-info">
            <h4>Will Include:</h4>
            <ul>
              <li>Charts & Graphs</li>
              <li>Inventory Turnover</li>
              <li>Profit Margins</li>
              <li>Performance Metrics</li>
              <li>Forecasting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

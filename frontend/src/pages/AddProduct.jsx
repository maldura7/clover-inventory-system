import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AddProduct.css';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    barcode: '',
    costPrice: '',
    sellingPrice: '',
    unitOfMeasure: 'unit',
    reorderLevel: '10',
    reorderQuantity: '50',
    taxRate: '0',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.costPrice || !formData.sellingPrice) {
      setError('Name, cost price, and selling price are required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      alert('Product created successfully!');
      navigate('/products');
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <h1>➕ Add New Product</h1>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                name="sku"
                placeholder="e.g., SKU-001"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>*Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Product description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Barcode</label>
              <input
                type="text"
                name="barcode"
                placeholder="Product barcode"
                value={formData.barcode}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Unit of Measure</label>
              <select name="unitOfMeasure" value={formData.unitOfMeasure} onChange={handleChange}>
                <option value="unit">Unit</option>
                <option value="box">Box</option>
                <option value="kg">Kilogram</option>
                <option value="liter">Liter</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Pricing</h2>

          <div className="form-row">
            <div className="form-group">
              <label>*Cost Price ($)</label>
              <input
                type="number"
                name="costPrice"
                placeholder="0.00"
                step="0.01"
                value={formData.costPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>*Selling Price ($)</label>
              <input
                type="number"
                name="sellingPrice"
                placeholder="0.00"
                step="0.01"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                placeholder="0"
                step="0.1"
                value={formData.taxRate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Inventory</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                placeholder="10"
                value={formData.reorderLevel}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Reorder Quantity</label>
              <input
                type="number"
                name="reorderQuantity"
                placeholder="50"
                value={formData.reorderQuantity}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Create Product'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/products')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

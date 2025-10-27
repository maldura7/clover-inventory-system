import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }

      console.log('Fetching products with token...');

      const url = search 
        ? `http://localhost:3001/api/products?search=${search}`
        : 'http://localhost:3001/api/products';

      console.log('Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Products data:', data);

      setProducts(data.products || []);
    } catch (err) {
      console.error('Products error:', err);
      setError(`Failed to load products: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        alert('Product deleted!');
        fetchProducts();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>📦 Products</h1>
        <Link to="/products/new" className="btn btn-primary">
          ➕ Add New Product
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, SKU, or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyUp={() => fetchProducts()}
        />
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={fetchProducts} style={{ marginLeft: '10px' }}>
            🔄 Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length > 0 ? (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><strong>{product.sku || '-'}</strong></td>
                  <td>{product.name}</td>
                  <td>{product.category_name || '-'}</td>
                  <td>${product.cost_price?.toFixed(2) || '0.00'}</td>
                  <td>${product.selling_price?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={`stock-badge ${product.total_stock <= product.reorder_level ? 'low' : ''}`}>
                      {product.total_stock || 0}
                    </span>
                  </td>
                  <td>
                    <Link to={`/products/${product.id}`} className="btn btn-sm btn-info">
                      ✏️ Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No products found yet. <Link to="/products/new">Create your first product</Link></p>
        </div>
      )}
    </div>
  );
}

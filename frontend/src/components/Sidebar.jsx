import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <nav className="sidebar-menu">
          <Link to="/dashboard" className="menu-item">
            <span className="icon">📊</span>
            <span className="label">Dashboard</span>
          </Link>

          <Link to="/products" className="menu-item">
            <span className="icon">📦</span>
            <span className="label">Products</span>
          </Link>

          <Link to="/inventory" className="menu-item">
            <span className="icon">📋</span>
            <span className="label">Inventory</span>
          </Link>

          <Link to="/clover" className="menu-item">
            <span className="icon">🔗</span>
            <span className="label">Clover POS</span>
          </Link>

          <Link to="/reports" className="menu-item">
            <span className="icon">📈</span>
            <span className="label">Reports</span>
          </Link>
        </nav>
      </div>

      <div className="sidebar-footer">
        <p>Inventory Pro v1.0</p>
      </div>
    </aside>
  );
}

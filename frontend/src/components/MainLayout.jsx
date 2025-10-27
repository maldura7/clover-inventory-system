import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/MainLayout.css';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="main-layout">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="layout-body">
        <Sidebar isOpen={sidebarOpen} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiHome, FiBox, FiPackage, FiTrendingUp, FiSettings, FiUsers, FiAlertCircle, 
         FiLogOut, FiPlus, FiEdit, FiTrash, FiDownload, FiUpload, FiRefreshCw } from 'react-icons/fi';
import './App.css';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return React.useContext(AuthContext);
}

// Login Page
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <FiBox className="text-6xl text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Clover Inventory Pro</h1>
          <p className="text-gray-500 mt-2">Enterprise Inventory Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="admin@cloverpro.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Default credentials:</p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
            admin@cloverpro.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Products" value={stats?.totalProducts || 0} icon={FiBox} color="blue" />
        <StatCard title="Inventory Value" value={`$${(stats?.totalInventoryValue || 0).toFixed(2)}`} icon={FiTrendingUp} color="green" />
        <StatCard title="Low Stock Items" value={stats?.lowStockProducts || 0} icon={FiAlertCircle} color="red" />
        <StatCard title="Active Alerts" value={stats?.activeAlerts || 0} icon={FiAlertCircle} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/products/new" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <FiPlus className="mr-3 text-blue-600" />
              <span className="text-blue-800 font-medium">Add New Product</span>
            </Link>
            <Link to="/inventory" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <FiPackage className="mr-3 text-green-600" />
              <span className="text-green-800 font-medium">Manage Inventory</span>
            </Link>
            <Link to="/clover" className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <FiRefreshCw className="mr-3 text-purple-600" />
              <span className="text-purple-800 font-medium">Sync with Clover</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${colors[color]}`}>
          <Icon className="text-2xl" />
        </div>
      </div>
    </div>
  );
}

// Products Page
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    api.get('/products')
      .then(res => setProducts(res.data.products || []))
      .catch(err => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <Link to="/products/new" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
          <FiPlus className="mr-2" /> Add Product
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.total_stock || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.selling_price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <FiEdit />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FiTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Clover Integration Page
function CloverPage() {
  const [loading, setLoading] = useState(false);
  const [syncHistory, setSyncHistory] = useState([]);

  useEffect(() => {
    loadSyncHistory();
  }, []);

  const loadSyncHistory = () => {
    api.get('/clover/sync-history')
      .then(res => setSyncHistory(res.data))
      .catch(err => toast.error('Failed to load sync history'));
  };

  const handleImport = async () => {
    const merchantId = prompt('Enter Clover Merchant ID:');
    const accessToken = prompt('Enter Clover Access Token:');
    const locationId = prompt('Enter Location ID (optional):');

    if (!merchantId || !accessToken) {
      toast.error('Merchant ID and Access Token are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/clover/import-inventory', { merchantId, accessToken, locationId });
      toast.success(`Import completed! ${res.data.recordsProcessed} products imported.`);
      loadSyncHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const merchantId = prompt('Enter Clover Merchant ID:');
    const accessToken = prompt('Enter Clover Access Token:');

    if (!merchantId || !accessToken) {
      toast.error('Merchant ID and Access Token are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/clover/export-inventory', { merchantId, accessToken });
      toast.success(`Export completed! ${res.data.recordsProcessed} products exported.`);
      loadSyncHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Clover POS Integration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Import from Clover</h2>
          <p className="text-gray-600 mb-4">Import products and inventory from your Clover POS system.</p>
          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50"
          >
            <FiDownload className="mr-2" /> Import Inventory
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Export to Clover</h2>
          <p className="text-gray-600 mb-4">Export your products to Clover POS system.</p>
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
          >
            <FiUpload className="mr-2" /> Export Inventory
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Sync History</h2>
        <div className="space-y-2">
          {syncHistory.map(sync => (
            <div key={sync.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium capitalize">{sync.sync_type}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {sync.records_processed} records processed
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                sync.status === 'completed' ? 'bg-green-100 text-green-800' : 
                sync.status === 'failed' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {sync.status}
              </span>
            </div>
          ))}
          {syncHistory.length === 0 && (
            <p className="text-gray-500 text-center py-4">No sync history available</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Layout
function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-indigo-900 text-white">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <FiBox className="text-3xl mr-2" />
            <div>
              <h1 className="text-xl font-bold">Clover Pro</h1>
              <p className="text-xs text-indigo-300">Inventory System</p>
            </div>
          </div>
          <nav className="space-y-2">
            <NavLink to="/" icon={FiHome}>Dashboard</NavLink>
            <NavLink to="/products" icon={FiBox}>Products</NavLink>
            <NavLink to="/inventory" icon={FiPackage}>Inventory</NavLink>
            <NavLink to="/clover" icon={FiRefreshCw}>Clover Sync</NavLink>
            <NavLink to="/reports" icon={FiTrendingUp}>Reports</NavLink>
            <NavLink to="/settings" icon={FiSettings}>Settings</NavLink>
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-6 border-t border-indigo-800">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center">
              <FiUsers />
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.fullName || user?.full_name}</p>
              <p className="text-xs text-indigo-300">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 bg-indigo-800 rounded hover:bg-indigo-700"
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="flex items-center px-4 py-3 rounded hover:bg-indigo-800 transition-colors">
      <Icon className="mr-3" />
      {children}
    </Link>
  );
}

// Protected Route
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

// Main App
function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Inventory Management</h1></div></ProtectedRoute>} />
          <Route path="/clover" element={<ProtectedRoute><CloverPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Reports</h1></div></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><div className="p-8"><h1 className="text-3xl font-bold">Settings</h1></div></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

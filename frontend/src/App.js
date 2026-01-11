import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Box, ArrowUpDown, FileText, Users, LogOut,AlertTriangle } from 'lucide-react';

// --- API Service ---
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        {user && (
          <nav className="w-64 bg-slate-800 text-white p-5 flex flex-col space-y-4">
            <h1 className="text-2xl font-bold mb-8 text-blue-400">E-Inventory</h1>
            <Link to="/" className="flex items-center gap-2 hover:text-blue-300"><LayoutDashboard size={20}/> Dashboard</Link>
            <Link to="/products" className="flex items-center gap-2 hover:text-blue-300"><Box size={20}/> Products</Link>
            <Link to="/stock" className="flex items-center gap-2 hover:text-blue-300"><ArrowUpDown size={20}/> Stock In/Out</Link>
            <Link to="/reports" className="flex items-center gap-2 hover:text-blue-300"><FileText size={20}/> Reports</Link>
            <button onClick={logout} className="mt-auto flex items-center gap-2 text-red-400 hover:text-red-300 border-t border-gray-700 pt-4"><LogOut size={20}/> Logout</button>
          </nav>
        )}

        <main className="flex-1 p-8">
          <Routes>
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/products" element={user ? <ProductManager /> : <Navigate to="/login" />} />
            <Route path="/stock" element={user ? <StockMovement user={user} /> : <Navigate to="/login" />} />
            <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// --- 1. LOGIN PAGE ---
const Login = ({ setUser }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/login', form);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    } catch (err) { alert("Invalid Credentials"); }
  };
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">System Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input className="border p-3 rounded" placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} required />
        <input className="border p-3 rounded" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} required />
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold transition">Sign In</button>
      </form>
    </div>
  );
};

// --- 2. DASHBOARD ---
const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, lowItems: [] });
  useEffect(() => {
    API.get('/products').then(res => {
      const low = res.data.filter(p => p.quantity < p.minStock);
      setStats({ total: res.data.length, lowItems: low });
    });
  }, []);
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Inventory Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 shadow rounded-lg border-l-8 border-blue-500">
          <h3 className="text-gray-500 font-semibold uppercase">Total Products</h3>
          <p className="text-4xl font-black">{stats.total}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg border-l-8 border-red-500">
          <h3 className="text-gray-500 font-semibold uppercase">Low Stock Alerts</h3>
          <p className="text-4xl font-black text-red-500">{stats.lowItems.length}</p>
        </div>
      </div>
      {stats.lowItems.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="text-red-700 font-bold flex items-center gap-2"><AlertTriangle size={18}/> Critical Stock Levels:</h4>
            <ul className="list-disc ml-6 mt-2">
                {stats.lowItems.map(p => <li key={p._id} className="text-red-600">{p.name} (Only {p.quantity} left)</li>)}
            </ul>
        </div>
      )}
    </div>
  );
};

// --- 3. PRODUCT MANAGEMENT ---
const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', price: 0, sku: '', minStock: 5 });

  useEffect(() => { loadProducts(); }, []);
  const loadProducts = () => API.get('/products').then(res => setProducts(res.data));

  const addProduct = async (e) => {
    e.preventDefault();
    await API.post('/products', form);
    loadProducts();
    setForm({ name: '', category: '', price: 0, sku: '', minStock: 5 });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Product Management</h2>
      <form onSubmit={addProduct} className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 shadow rounded">
        <input className="border p-2 rounded" placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input className="border p-2 rounded" placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required />
        <input className="border p-2 rounded" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
        <input className="border p-2 rounded" placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
        <button className="bg-green-600 text-white p-2 rounded hover:bg-green-700">Add Product</button>
      </form>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-white">
            <tr><th className="p-4">SKU</th><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Stock</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono text-sm">{p.sku}</td>
                <td className="p-4 font-bold">{p.name}</td>
                <td className="p-4">{p.category}</td>
                <td className={`p-4 font-bold ${p.quantity < p.minStock ? 'text-red-500' : 'text-green-600'}`}>{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 4. STOCK MOVEMENT (IN/OUT) ---
const StockMovement = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [movement, setMovement] = useState({ productId: '', quantity: 0, type: 'IN' });

  useEffect(() => { API.get('/products').then(res => setProducts(res.data)); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/stock-update', { ...movement, user: user.username });
      alert("Stock updated successfully!");
      setMovement({ productId: '', quantity: 0, type: 'IN' });
    } catch (err) { alert(err.response.data.message); }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Stock In / Stock Out</h2>
      <form onSubmit={handleUpdate} className="bg-white p-6 shadow rounded-lg flex flex-col gap-4">
        <label className="font-semibold">Select Product</label>
        <select className="border p-2 rounded" onChange={e => setMovement({...movement, productId: e.target.value})} required>
          <option value="">-- Choose a Product --</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name} (Current: {p.quantity})</option>)}
        </select>
        
        <label className="font-semibold">Movement Type</label>
        <select className="border p-2 rounded" onChange={e => setMovement({...movement, type: e.target.value})}>
          <option value="IN">Stock In (Purchase/Restock)</option>
          <option value="OUT">Stock Out (Sale/Usage)</option>
        </select>

        <label className="font-semibold">Quantity</label>
        <input className="border p-2 rounded" type="number" min="1" onChange={e => setMovement({...movement, quantity: parseInt(e.target.value)})} required />
        
        <button className="bg-blue-600 text-white p-3 rounded font-bold mt-4 hover:bg-blue-700">Submit Update</button>
      </form>
    </div>
  );
};

// --- 5. REPORTS / AUDIT LOG ---
const Reports = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { API.get('/transactions').then(res => setLogs(res.data)); }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Inventory Audit Logs</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr><th className="p-4">Date</th><th className="p-4">Product</th><th className="p-4">Type</th><th className="p-4">Qty</th><th className="p-4">User</th></tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} className="border-b text-sm">
                <td className="p-4">{new Date(log.date).toLocaleString()}</td>
                <td className="p-4 font-semibold">{log.productName}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {log.type}
                    </span>
                </td>
                <td className="p-4">{log.quantity}</td>
                <td className="p-4 text-gray-500">{log.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
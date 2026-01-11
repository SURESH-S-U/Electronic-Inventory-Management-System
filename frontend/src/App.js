import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Box, ArrowUpDown, FileText, LogOut, Tags, Truck, UserPlus } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const App = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    // Function to get the ID badge (Token)
    const getConfig = () => ({
        headers: { Authorization: user?.token }
    });

    const logout = () => { localStorage.removeItem('user'); setUser(null); };

    return (
        <Router>
            <div className="flex min-h-screen bg-gray-100">
                {user && (
                    <nav className="w-64 bg-slate-900 text-white p-6 flex flex-col space-y-4 font-sans">
                        <h1 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-widest">InvMaster</h1>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/"><LayoutDashboard size={18}/> Dashboard</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/products"><Box size={18}/> Products</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/categories"><Tags size={18}/> Categories</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/suppliers"><Truck size={18}/> Suppliers</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/stock"><ArrowUpDown size={18}/> Stock Movement</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/reports"><FileText size={18}/> Audit Logs</Link>
                        <div className="mt-auto border-t border-gray-700 pt-4">
                            <p className="text-xs text-gray-400 mb-2">Logged in as: <span className="text-blue-300">{user.username}</span></p>
                            <button onClick={logout} className="flex gap-2 items-center text-red-400 hover:text-red-300"><LogOut size={18}/> Logout</button>
                        </div>
                    </nav>
                )}
                <main className="flex-1 p-8">
                    <Routes>
                        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
                        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                        <Route path="/" element={user ? <Dashboard getConfig={getConfig} /> : <Navigate to="/login" />} />
                        <Route path="/products" element={user ? <ProductManager getConfig={getConfig} /> : <Navigate to="/login" />} />
                        <Route path="/categories" element={user ? <CategoryManager getConfig={getConfig} /> : <Navigate to="/login" />} />
                        <Route path="/suppliers" element={user ? <SupplierManager getConfig={getConfig} /> : <Navigate to="/login" />} />
                        <Route path="/stock" element={user ? <StockMovement getConfig={getConfig} /> : <Navigate to="/login" />} />
                        <Route path="/reports" element={user ? <Reports getConfig={getConfig} /> : <Navigate to="/login" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

// --- REGISTER COMPONENT ---
const Register = () => {
    const [f, setF] = useState({ username: '', password: '' });
    const reg = async (e) => {
        e.preventDefault();
        try { await axios.post(`${API_URL}/register`, f); alert("Created! Now Login."); window.location.href = '/login'; }
        catch { alert("User already exists"); }
    };
    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-blue-600">Create Account</h2>
            <form onSubmit={reg} className="flex flex-col gap-4">
                <input className="border p-3 rounded" placeholder="Username" onChange={e => setF({...f, username: e.target.value})} required />
                <input className="border p-3 rounded" type="password" placeholder="Password" onChange={e => setF({...f, password: e.target.value})} required />
                <button className="bg-blue-600 text-white p-3 rounded font-bold">Register Now</button>
                <Link to="/login" className="text-center text-gray-500">Back to Login</Link>
            </form>
        </div>
    );
};

// --- LOGIN COMPONENT ---
const Login = ({ setUser }) => {
    const [f, setF] = useState({ username: '', password: '' });
    const log = async (e) => {
        e.preventDefault();
        try { 
            const res = await axios.post(`${API_URL}/login`, f); 
            localStorage.setItem('user', JSON.stringify(res.data)); 
            setUser(res.data); 
        } catch { alert("Invalid credentials"); }
    };
    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-6">Inventory Login</h2>
            <form onSubmit={log} className="flex flex-col gap-4 text-left">
                <input className="border p-3 rounded" placeholder="Username" onChange={e => setF({...f, username: e.target.value})} required />
                <input className="border p-3 rounded" type="password" placeholder="Password" onChange={e => setF({...f, password: e.target.value})} required />
                <button className="bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700">Sign In</button>
                <Link to="/register" className="text-center text-blue-600 font-semibold">New user? Create a separate inventory</Link>
            </form>
        </div>
    );
};

// --- DASHBOARD ---
const Dashboard = ({ getConfig }) => {
    const [c, setC] = useState({ p: 0, s: 0 });
    useEffect(() => { 
        axios.get(`${API_URL}/products`, getConfig()).then(r => {
            setC({ p: r.data.length, s: r.data.filter(x => x.quantity < 5).length });
        });
    }, []);
    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-12 shadow-md rounded-xl text-center border-t-8 border-blue-500">
                <h2 className="text-gray-500 uppercase tracking-widest mb-2">My Total Items</h2>
                <h1 className="text-5xl font-black">{c.p}</h1>
            </div>
            <div className="bg-white p-12 shadow-md rounded-xl text-center border-t-8 border-red-500">
                <h2 className="text-gray-500 uppercase tracking-widest mb-2">My Low Stock</h2>
                <h1 className="text-5xl font-black text-red-500">{c.s}</h1>
            </div>
        </div>
    );
};



// --- PRODUCT MANAGER ---
const ProductManager = ({ getConfig }) => {
    const [p, setP] = useState([]);
    const [cats, setCats] = useState([]);
    const [f, setF] = useState({ name: '', category: '', price: 0, sku: '' });
    const [searchTerm, setSearchTerm] = useState(''); // NEW STATE

    useEffect(() => { 
        axios.get(`${API_URL}/products`, getConfig()).then(r => setP(r.data)); 
        axios.get(`${API_URL}/categories`, getConfig()).then(r => setCats(r.data));
    }, []);

    const save = async (e) => {
        e.preventDefault();
        await axios.post(`${API_URL}/products`, f, getConfig());
        window.location.reload();
    };

    // FILTER LOGIC
    const filteredProducts = p.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-2xl">My Inventory</h2>
                <input 
                    className="border p-2 rounded w-64 shadow-sm" 
                    placeholder="🔍 Search products or categories..." 
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* ... keep the same form ... */}

            <table className="w-full bg-white shadow rounded overflow-hidden">
                <thead className="bg-gray-800 text-white text-left">
                    <tr><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Stock</th></tr>
                </thead>
                <tbody>{filteredProducts.map(x => ( // USE FILTERED LIST HERE
                    <tr key={x._id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-semibold">{x.name}</td>
                        <td className="p-4 text-gray-500">{x.category}</td>
                        <td className={`p-4 font-bold ${x.quantity < 5 ? 'text-red-500' : 'text-green-600'}`}>{x.quantity}</td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
};


// --- CATEGORY MANAGER ---
const CategoryManager = ({ getConfig }) => {
    const [cats, setCats] = useState([]);
    const [n, setN] = useState('');
    useEffect(() => { axios.get(`${API_URL}/categories`, getConfig()).then(r => setCats(r.data)); }, []);
    const add = async () => { await axios.post(`${API_URL}/categories`, { name: n }, getConfig()); window.location.reload(); };
    return (
        <div className="max-w-xl bg-white p-8 shadow rounded">
            <h2 className="font-bold text-xl mb-4">My Categories</h2>
            <div className="flex gap-2 mb-6">
                <input className="border p-2 flex-1 rounded" placeholder="E.g. Smartwatches" onChange={e => setN(e.target.value)} />
                <button onClick={add} className="bg-blue-600 text-white px-6 rounded">Add</button>
            </div>
            <div className="divide-y">
                {cats.map(c => <div key={c._id} className="py-3 text-gray-700 font-medium"># {c.name}</div>)}
            </div>
        </div>
    );
};

// --- STOCK MOVEMENT ---
const StockMovement = ({ getConfig }) => {
    const [p, setP] = useState([]);
    const [m, setM] = useState({ productId: '', quantity: 0, type: 'IN' });
    useEffect(() => { axios.get(`${API_URL}/products`, getConfig()).then(r => setP(r.data)); }, []);
    const update = async () => { 
        if (!m.productId) return alert("Select product");
        await axios.post(`${API_URL}/stock-update`, m, getConfig()); 
        alert("Stock Updated!"); window.location.reload(); 
    };
    return (
        <div className="bg-white p-8 shadow-lg rounded-xl max-w-md mx-auto">
            <h2 className="font-bold text-2xl mb-6 text-center">Manage Stock</h2>
            <div className="space-y-4">
                <select className="border p-3 w-full rounded" onChange={e => setM({...m, productId: e.target.value})}>
                    <option value="">-- Choose Product --</option>
                    {p.map(x => <option key={x._id} value={x._id}>{x.name} (Current: {x.quantity})</option>)}
                </select>
                <select className="border p-3 w-full rounded bg-gray-50" onChange={e => setM({...m, type: e.target.value})}>
                    <option value="IN">Stock In (+)</option>
                    <option value="OUT">Stock Out (-)</option>
                </select>
                <input type="number" placeholder="How many units?" className="border p-3 w-full rounded" onChange={e => setM({...m, quantity: parseInt(e.target.value)})} />
                <button onClick={update} className="bg-blue-600 text-white w-full p-4 rounded-lg font-bold text-lg hover:bg-blue-700">Submit Transaction</button>
            </div>
        </div>
    );
};

// --- SUPPLIERS ---
const SupplierManager = ({ getConfig }) => {
    const [s, setS] = useState([]);
    const [f, setF] = useState({ name: '', contact: '' });
    useEffect(() => { axios.get(`${API_URL}/suppliers`, getConfig()).then(r => setS(r.data)); }, []);
    const add = async () => { await axios.post(`${API_URL}/suppliers`, f, getConfig()); window.location.reload(); };
    return (
        <div className="bg-white p-8 shadow rounded">
            <h2 className="font-bold text-xl mb-6">My Suppliers</h2>
            <div className="flex gap-2 mb-8">
                <input className="border p-2 rounded w-full" placeholder="Supplier Name" onChange={e => setF({...f, name: e.target.value})} />
                <input className="border p-2 rounded w-full" placeholder="Phone/Contact" onChange={e => setF({...f, contact: e.target.value})} />
                <button onClick={add} className="bg-blue-600 text-white px-8 rounded font-bold">Add</button>
            </div>
            <table className="w-full text-left">
                <thead className="border-b uppercase text-xs text-gray-400"><tr><th className="pb-2">Name</th><th className="pb-2">Contact</th></tr></thead>
                <tbody>{s.map(x => <tr key={x._id} className="border-b"><td className="py-3 font-semibold">{x.name}</td><td>{x.contact}</td></tr>)}</tbody>
            </table>
        </div>
    );
};

// --- REPORTS ---
const Reports = ({ getConfig }) => {
    const [l, setL] = useState([]);
    useEffect(() => { axios.get(`${API_URL}/transactions`, getConfig()).then(r => setL(r.data)); }, []);

    const downloadCSV = () => {
      const headers = "Date,Item,Type,Quantity,User\n";
      const rows = l.map(x => `${new Date(x.date).toLocaleDateString()},${x.productName},${x.type},${x.quantity},${x.user}`).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory_report.csv';
      a.click();
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
             <button onClick={downloadCSV} className="mb-4 bg-gray-700 text-white px-4 py-2 rounded text-sm font-bold">
             📥 Export to Excel (CSV)
             </button>
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 border-b">
                    <tr><th className="p-4">Date & Time</th><th className="p-4">Item</th><th className="p-4">Action</th><th className="p-4">Qty</th><th className="p-4">Done By</th></tr>
                </thead>
                <tbody>{l.map(x => (
                    <tr key={x._id} className="border-b text-sm">
                        <td className="p-4 text-gray-500">{new Date(x.date).toLocaleString()}</td>
                        <td className="p-4 font-bold uppercase">{x.productName}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${x.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {x.type}
                            </span>
                        </td>
                        <td className="p-4 font-mono">{x.quantity}</td>
                        <td className="p-4 italic text-gray-400">{x.user}</td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
};

export default App;
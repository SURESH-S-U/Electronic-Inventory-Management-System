import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Box, ArrowUpDown, FileText, LogOut, Tags, Truck, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API_URL = 'http://localhost:5000/api';

const App = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const getConfig = () => ({ headers: { Authorization: user?.token } });
    const logout = () => { localStorage.removeItem('user'); setUser(null); };

    return (
        <Router>
            <div className="flex min-h-screen bg-gray-100">
                {user && (
                    <nav className="w-64 bg-slate-900 text-white p-6 flex flex-col space-y-4 font-sans shadow-xl">
                        <h1 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-widest border-b border-gray-700 pb-2">InvMaster Pro</h1>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/"><LayoutDashboard size={18}/> Dashboard</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/products"><Box size={18}/> Products</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/categories"><Tags size={18}/> Categories</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/suppliers"><Truck size={18}/> Suppliers</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/stock"><ArrowUpDown size={18}/> Stock Movement</Link>
                        <Link className="flex gap-2 items-center hover:text-blue-300 transition" to="/reports"><FileText size={18}/> Audit Logs</Link>
                        <div className="mt-auto border-t border-gray-700 pt-4">
                            <p className="text-xs text-gray-400 mb-2 font-bold italic">User: {user.username}</p>
                            <button onClick={logout} className="flex gap-2 items-center text-red-400 hover:text-red-300 transition w-full p-2 rounded hover:bg-red-900/10"><LogOut size={18}/> Logout</button>
                        </div>
                    </nav>
                )}
                <main className="flex-1 p-8 overflow-y-auto h-screen">
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

// --- ENHANCED DASHBOARD WITH CHARTS ---
const Dashboard = ({ getConfig }) => {
    const [data, setData] = useState({ p: [], c: 0, s: 0, t: 0 });

    useEffect(() => { 
        const fetchAll = async () => {
            const resP = await axios.get(`${API_URL}/products`, getConfig());
            const resC = await axios.get(`${API_URL}/categories`, getConfig());
            const resS = await axios.get(`${API_URL}/suppliers`, getConfig());
            const resT = await axios.get(`${API_URL}/transactions`, getConfig());
            setData({ p: resP.data, c: resC.data.length, s: resS.data.length, t: resT.data.length });
        };
        fetchAll();
    }, []);

    const lowStockCount = data.p.filter(x => x.quantity < 5).length;
    
    // Chart 1: Stock levels by Category
    const categoryData = data.p.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.quantity;
        return acc;
    }, {});
    const barData = Object.keys(categoryData).map(key => ({ name: key, stock: categoryData[key] }));

    // Chart 2: Inventory Health
    const pieData = [
        { name: 'Healthy', value: data.p.length - lowStockCount },
        { name: 'Low Stock', value: lowStockCount }
    ];
    const COLORS = ['#10B981', '#EF4444'];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 border-b pb-2">Business Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-blue-500">
                    <h3 className="text-gray-400 text-xs font-bold uppercase">Products</h3>
                    <p className="text-3xl font-black">{data.p.length}</p>
                </div>
                <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-red-500">
                    <h3 className="text-gray-400 text-xs font-bold uppercase">Low Stock</h3>
                    <p className="text-3xl font-black text-red-500">{lowStockCount}</p>
                </div>
                <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-purple-500">
                    <h3 className="text-gray-400 text-xs font-bold uppercase">Categories</h3>
                    <p className="text-3xl font-black text-purple-600">{data.c}</p>
                </div>
                <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-green-500">
                    <h3 className="text-gray-400 text-xs font-bold uppercase">Transactions</h3>
                    <p className="text-3xl font-black text-green-600">{data.t}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 shadow-md rounded-xl h-80">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowUpDown size={18}/> Stock by Category</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="stock" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 shadow-md rounded-xl h-80">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle size={18}/> Inventory Health</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value">
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- UPDATED PRODUCT MANAGER ---
const ProductManager = ({ getConfig }) => {
    const [p, setP] = useState([]);
    const [cats, setCats] = useState([]);
    const [sups, setSups] = useState([]);
    const [f, setF] = useState({ name: '', category: '', price: 0, sku: '', quantity: 0, image: '', supplier: '' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { 
        const load = async () => {
            const resP = await axios.get(`${API_URL}/products`, getConfig()); 
            const resC = await axios.get(`${API_URL}/categories`, getConfig());
            const resS = await axios.get(`${API_URL}/suppliers`, getConfig());
            setP(resP.data); setCats(resC.data); setSups(resS.data);
        };
        load();
    }, []);

    const save = async (e) => {
        e.preventDefault();
        await axios.post(`${API_URL}/products`, f, getConfig());
        window.location.reload();
    };

    const filteredProducts = p.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-2xl text-slate-800">Inventory Management</h2>
                <input 
                    className="border p-2 rounded-lg w-64 shadow-sm" 
                    placeholder="🔍 Search name, category, or SKU..." 
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <form onSubmit={save} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input className="border p-2 rounded" placeholder="Product Name" onChange={e => setF({...f, name: e.target.value})} required />
                <input className="border p-2 rounded" placeholder="SKU" onChange={e => setF({...f, sku: e.target.value})} required />
                <select className="border p-2 rounded" onChange={e => setF({...f, category: e.target.value})} required>
                    <option value="">Select Category</option>
                    {cats.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
                <select className="border p-2 rounded" onChange={e => setF({...f, supplier: e.target.value})} required>
                    <option value="">Select Supplier</option>
                    {sups.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
                <input className="border p-2 rounded" type="number" placeholder="Price" onChange={e => setF({...f, price: e.target.value})} required />
                <input className="border p-2 rounded" type="number" placeholder="Initial Quantity" onChange={e => setF({...f, quantity: e.target.value})} required />
                <input className="border p-2 rounded" placeholder="Image URL" onChange={e => setF({...f, image: e.target.value})} />
                <button className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition">Add Product</button>
            </form>

            <div className="bg-white shadow rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="p-4">Img</th><th className="p-4">Name</th><th className="p-4">SKU</th><th className="p-4">Category</th><th className="p-4">Stock</th>
                        </tr>
                    </thead>
                    <tbody>{filteredProducts.map(x => (
                        <tr key={x._id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                                {x.image ? <img src={x.image} alt="p" className="w-10 h-10 rounded object-cover border"/> : <ImageIcon className="text-gray-300"/>}
                            </td>
                            <td className="p-4 font-bold">{x.name}</td>
                            <td className="p-4 font-mono text-sm text-gray-500">{x.sku}</td>
                            <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{x.category}</span></td>
                            <td className={`p-4 font-black ${x.quantity < 5 ? 'text-red-500 underline' : 'text-green-600'}`}>{x.quantity}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
};

// (Rest of your components: Login, Register, CategoryManager, SupplierManager, StockMovement, Reports stay mostly the same but ensure they match API_URL)

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
        <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-lg text-center border-t-8 border-blue-600">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-widest text-slate-800">Login</h2>
            <form onSubmit={log} className="flex flex-col gap-4 text-left">
                <input className="border p-3 rounded shadow-sm focus:outline-blue-500" placeholder="Username" onChange={e => setF({...f, username: e.target.value})} required />
                <input className="border p-3 rounded shadow-sm focus:outline-blue-500" type="password" placeholder="Password" onChange={e => setF({...f, password: e.target.value})} required />
                <button className="bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">Sign In</button>
                <Link to="/register" className="text-center text-blue-600 font-semibold hover:underline">New here? Create Separate Vault</Link>
            </form>
        </div>
    );
};

const Register = () => {
    const [f, setF] = useState({ username: '', password: '' });
    const reg = async (e) => {
        e.preventDefault();
        try { await axios.post(`${API_URL}/register`, f); alert("Created! Now Login."); window.location.href = '/login'; }
        catch { alert("User already exists"); }
    };
    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-lg border-t-8 border-green-500">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-widest text-slate-800">Register</h2>
            <form onSubmit={reg} className="flex flex-col gap-4">
                <input className="border p-3 rounded focus:outline-green-500" placeholder="Username" onChange={e => setF({...f, username: e.target.value})} required />
                <input className="border p-3 rounded focus:outline-green-500" type="password" placeholder="Password" onChange={e => setF({...f, password: e.target.value})} required />
                <button className="bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">Get Started</button>
                <Link to="/login" className="text-center text-gray-500 font-semibold">Back to Login</Link>
            </form>
        </div>
    );
};

const CategoryManager = ({ getConfig }) => {
    const [cats, setCats] = useState([]);
    const [n, setN] = useState('');
    useEffect(() => { axios.get(`${API_URL}/categories`, getConfig()).then(r => setCats(r.data)); }, []);
    const add = async () => { if(!n) return; await axios.post(`${API_URL}/categories`, { name: n }, getConfig()); window.location.reload(); };
    return (
        <div className="max-w-xl bg-white p-8 shadow rounded-xl">
            <h2 className="font-bold text-xl mb-4 text-slate-800 border-b pb-2">Manage Categories</h2>
            <div className="flex gap-2 mb-6">
                <input className="border p-2 flex-1 rounded focus:ring-2 ring-blue-100 outline-none" placeholder="e.g. Smartwatches" onChange={e => setN(e.target.value)} />
                <button onClick={add} className="bg-blue-600 text-white px-6 rounded font-bold hover:bg-blue-700 transition">Add</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {cats.map(c => <div key={c._id} className="p-3 bg-slate-50 border rounded-lg font-medium text-slate-600"># {c.name}</div>)}
            </div>
        </div>
    );
};

const SupplierManager = ({ getConfig }) => {
    const [s, setS] = useState([]);
    const [f, setF] = useState({ name: '', contact: '' });
    useEffect(() => { axios.get(`${API_URL}/suppliers`, getConfig()).then(r => setS(r.data)); }, []);
    const add = async () => { await axios.post(`${API_URL}/suppliers`, f, getConfig()); window.location.reload(); };
    return (
        <div className="bg-white p-8 shadow rounded-xl max-w-2xl">
            <h2 className="font-bold text-xl mb-6 text-slate-800 border-b pb-2">Supplier Directory</h2>
            <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-lg">
                <input className="border p-2 rounded" placeholder="Supplier Name" onChange={e => setF({...f, name: e.target.value})} />
                <input className="border p-2 rounded" placeholder="Contact/Phone" onChange={e => setF({...f, contact: e.target.value})} />
                <button onClick={add} className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition col-span-2">Register Vendor</button>
            </div>
            <table className="w-full text-left">
                <thead className="border-b uppercase text-xs text-gray-400"><tr><th className="pb-2">Name</th><th className="pb-2">Contact</th></tr></thead>
                <tbody>{s.map(x => <tr key={x._id} className="border-b hover:bg-slate-50 transition"><td className="py-3 font-bold">{x.name}</td><td>{x.contact}</td></tr>)}</tbody>
            </table>
        </div>
    );
};

const StockMovement = ({ getConfig }) => {
    const [p, setP] = useState([]);
    const [m, setM] = useState({ productId: '', quantity: 0, type: 'IN' });
    useEffect(() => { axios.get(`${API_URL}/products`, getConfig()).then(r => setP(r.data)); }, []);
    const update = async () => { 
        if (!m.productId || m.quantity <= 0) return alert("Select product and valid quantity");
        await axios.post(`${API_URL}/stock-update`, m, getConfig()); 
        alert("Stock Updated!"); window.location.reload(); 
    };
    return (
        <div className="bg-white p-8 shadow-xl rounded-2xl max-w-md mx-auto border-t-8 border-slate-800">
            <h2 className="font-bold text-2xl mb-6 text-center text-slate-800">Manage Inventory</h2>
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Product</label>
                <select className="border p-3 w-full rounded-lg bg-slate-50" onChange={e => setM({...m, productId: e.target.value})}>
                    <option value="">-- Choose Target --</option>
                    {p.map(x => <option key={x._id} value={x._id}>{x.name} (Current: {x.quantity})</option>)}
                </select>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Movement Type</label>
                <div className="flex gap-2">
                    <button onClick={() => setM({...m, type: 'IN'})} className={`flex-1 p-2 rounded font-bold ${m.type==='IN' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>IN (+)</button>
                    <button onClick={() => setM({...m, type: 'OUT'})} className={`flex-1 p-2 rounded font-bold ${m.type==='OUT' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>OUT (-)</button>
                </div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</label>
                <input type="number" placeholder="Enter quantity" className="border p-3 w-full rounded-lg shadow-inner" onChange={e => setM({...m, quantity: parseInt(e.target.value)})} />
                <button onClick={update} className="bg-slate-900 text-white w-full p-4 rounded-xl font-black text-lg shadow-lg hover:bg-black transition mt-4">COMMIT TRANSACTION</button>
            </div>
        </div>
    );
};

const Reports = ({ getConfig }) => {
    const [l, setL] = useState([]);
    useEffect(() => { axios.get(`${API_URL}/transactions`, getConfig()).then(r => setL(r.data)); }, []);

    const downloadCSV = () => {
      const headers = "Date,Item,Type,Quantity,User\n";
      const rows = l.map(x => `${new Date(x.date).toLocaleDateString()},${x.productName},${x.type},${x.quantity},${x.user}`).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'inventory_report.csv'; a.click();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Audit Logs</h2>
                <button onClick={downloadCSV} className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black shadow-lg">
                    📥 Download Report (CSV)
                </button>
            </div>
            <div className="bg-white shadow rounded-xl overflow-hidden border">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <th className="p-4">Timestamp</th><th className="p-4">Item</th><th className="p-4">Action</th><th className="p-4">Qty</th><th className="p-4">User</th>
                        </tr>
                    </thead>
                    <tbody>{l.map(x => (
                        <tr key={x._id} className="border-b text-sm">
                            <td className="p-4 text-gray-500">{new Date(x.date).toLocaleString()}</td>
                            <td className="p-4 font-bold">{x.productName}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${x.type === 'IN' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                                    {x.type}
                                </span>
                            </td>
                            <td className="p-4 font-mono font-bold">{x.quantity}</td>
                            <td className="p-4 text-gray-400">{x.user}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
};

export default App;
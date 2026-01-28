import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Box, ArrowUpDown, FileText, LogOut, Tags, Truck, Image as ImageIcon, Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const App = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    
    // Wrapped in useCallback to prevent unnecessary re-renders in child effects
    const getConfig = useCallback(() => ({ 
        headers: { Authorization: user?.token } 
    }), [user?.token]);

    const logout = () => { localStorage.removeItem('user'); setUser(null); };

    // Standardized Link Style
    const navLinkClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 group text-sm";

    return (
        <Router>
            <div className="flex min-h-screen bg-gray-100">
                {user && (
                    <nav className="w-64 bg-slate-900 text-slate-300 p-4 flex flex-col shadow-xl">
                        <div className="flex items-center gap-3 px-2 py-4 mb-6">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Box className="text-white" size={20}/>
                            </div>
                            <h1 className="text-lg font-bold text-white tracking-tight">
                                E-<span className="text-blue-400">INVENTORY</span>
                            </h1>
                        </div>

                        <div className="flex flex-col space-y-1 flex-1">
                            <Link className={navLinkClass} to="/">
                                <LayoutDashboard size={18} className="group-hover:text-blue-400"/> 
                                <span>Dashboard</span>
                            </Link>
                            <Link className={navLinkClass} to="/products">
                                <Box size={18} className="group-hover:text-blue-400"/> 
                                <span>Products</span>
                            </Link>
                            <Link className={navLinkClass} to="/categories">
                                <Tags size={18} className="group-hover:text-blue-400"/> 
                                <span>Categories</span>
                            </Link>
                            <Link className={navLinkClass} to="/suppliers">
                                <Truck size={18} className="group-hover:text-blue-400"/> 
                                <span>Suppliers</span>
                            </Link>
                            
                            <div className="pt-4 mt-4 border-t border-white/10">
                                <Link className={navLinkClass} to="/stock">
                                    <ArrowUpDown size={18} className="group-hover:text-blue-400"/> 
                                    <span>Stock Movement</span>
                                </Link>
                                <Link className={navLinkClass} to="/reports">
                                    <FileText size={18} className="group-hover:text-blue-400"/> 
                                    <span>Audit Logs</span>
                                </Link>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-white truncate">{user.username}</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Admin</p>
                                </div>
                            </div>
                            <button 
                                onClick={logout} 
                                className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm font-medium"
                            >
                                <LogOut size={16}/> Logout
                            </button>
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

// --- AUTH COMPONENTS ---

const Login = ({ setUser }) => {
    const [f, setF] = useState({ username: '', password: '' });
    const log = async (e) => {
        e.preventDefault();
        try { 
            const res = await axios.post(`${API_URL}/login`, f); 
            localStorage.setItem('user', JSON.stringify(res.data)); 
            setUser(res.data); 
        } catch { alert("Invalid login credentials"); }
    };
    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-lg text-center border-t-8 border-blue-600">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-widest text-slate-800 italic">Login</h2>
            <form onSubmit={log} className="flex flex-col gap-4 text-left">
                <input className="border p-3 rounded shadow-inner focus:outline-blue-500" placeholder="Username" onChange={e => setF({...f, username: e.target.value})} required />
                <input className="border p-3 rounded shadow-inner focus:outline-blue-500" type="password" placeholder="Password" onChange={e => setF({...f, password: e.target.value})} required />
                <button className="bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg uppercase tracking-tighter">Sign In</button>
                <Link to="/register" className="text-center text-blue-600 font-semibold hover:underline text-sm">Create New Admin Account</Link>
            </form>
        </div>
    );
};

const Register = () => {
    const [f, setF] = useState({ username: '', password: '' });
    const reg = async (e) => {
        e.preventDefault();
        try { await axios.post(`${API_URL}/register`, f); alert("Created! Now Login."); window.location.href = '/login'; }
        catch { alert("Username unavailable"); }
    };
    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-lg border-t-8 border-green-500 text-center">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-widest text-slate-800 italic">Register</h2>
            <form onSubmit={reg} className="flex flex-col gap-4 text-left">
                <input className="border p-3 rounded focus:outline-green-500" placeholder="Username" onChange={e => setF({...f, username: e.target.value})} required />
                <input className="border p-3 rounded focus:outline-green-500" type="password" placeholder="Password" onChange={e => setF({...f, password: e.target.value})} required />
                <button className="bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg uppercase tracking-tighter">Start Now</button>
                <Link to="/login" className="text-center text-gray-500 font-semibold hover:underline text-sm">Back to Login</Link>
            </form>
        </div>
    );
};

// --- DASHBOARD ---

const Dashboard = ({ getConfig }) => {
    const [data, setData] = useState({ p: [], c: [], s: [], t: [] });
    const [showLowStockModal, setShowLowStockModal] = useState(false);

    useEffect(() => { 
        const fetchAll = async () => {
            try {
                const resP = await axios.get(`${API_URL}/products`, getConfig());
                const resC = await axios.get(`${API_URL}/categories`, getConfig());
                const resS = await axios.get(`${API_URL}/suppliers`, getConfig());
                const resT = await axios.get(`${API_URL}/transactions`, getConfig());
                setData({ p: resP.data, c: resC.data, s: resS.data, t: resT.data });
            } catch (err) { console.error("Dashboard fetch error", err); }
        };
        fetchAll();
    }, [getConfig]);

    const lowStockItems = data.p.filter(x => x.quantity < 5);
    const lowStockCount = lowStockItems.length;
    
    const barData = data.c.map(cat => {
        const totalStock = data.p
            .filter(prod => prod.category === cat.name)
            .reduce((sum, curr) => sum + curr.quantity, 0);
        return { name: cat.name, stock: totalStock };
    });

    const pieData = [
        { name: 'Healthy', value: data.p.length - lowStockCount },
        { name: 'Low Stock', value: lowStockCount }
    ];
    const COLORS = ['#10B981', '#EF4444'];

    return (
        <div className="space-y-6 relative">
            <h2 className="text-3xl font-bold text-blue-600 border-b pb-2">Business Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-blue-500 hover:scale-105 transition cursor-default">
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Products</h3>
                    <p className="text-3xl font-black">{data.p.length}</p>
                </div>

                <div 
                    onClick={() => setShowLowStockModal(true)}
                    className="bg-white p-6 shadow-md rounded-xl border-l-4 border-red-500 hover:scale-105 transition cursor-pointer group"
                >
                    <div className="flex justify-between items-start">
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest group-hover:text-red-500">Low Stock</h3>
                        <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                    </div>
                    <p className="text-3xl font-black text-red-500">{lowStockCount}</p>
                    <p className="text-[10px] text-red-400 font-bold mt-1">Click to view items →</p>
                </div>

                <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-purple-500">
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Categories</h3>
                    <p className="text-3xl font-black text-purple-600">{data.c.length}</p>
                </div>
                <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-green-500">
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Suppliers</h3>
                    <p className="text-3xl font-black text-green-600">{data.s.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 shadow-md rounded-xl h-80">
                    <h3 className="font-bold mb-4 text-slate-700 italic border-b pb-2">📦 Current Category Levels</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={10} interval={0} />
                            <YAxis fontSize={10} />
                            <Tooltip cursor={{fill: '#f9fafb'}} />
                            <Bar dataKey="stock" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 shadow-md rounded-xl h-80">
                    <h3 className="font-bold mb-4 text-slate-700 italic border-b pb-2 text-right">🏥 Stock Health Analysis</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value" stroke="none" paddingAngle={5}>
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {showLowStockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-red-600 p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-lg">
                                <AlertTriangle size={20}/> Critical Stock Alert
                            </h3>
                            <button 
                                onClick={() => setShowLowStockModal(false)}
                                className="bg-white/20 hover:bg-white/40 px-3 py-1 rounded-lg text-sm transition font-bold"
                            >
                                Close ✕
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {lowStockCount > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="text-gray-400 text-[10px] uppercase font-black border-b">
                                        <tr><th className="pb-2">Product</th><th className="pb-2">SKU</th><th className="pb-2 text-right">Stock</th></tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {lowStockItems.map(item => (
                                            <tr key={item._id} className="hover:bg-red-50 transition">
                                                <td className="py-3 font-bold text-slate-700">{item.name}</td>
                                                <td className="py-3 text-gray-400 font-mono text-xs">{item.sku}</td>
                                                <td className="py-3 text-right font-black text-red-600">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center py-10 text-gray-500 font-medium italic">No low stock items found. Your inventory is healthy!</p>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t text-center">
                            <Link 
                                to="/stock" 
                                onClick={() => setShowLowStockModal(false)}
                                className="text-blue-600 font-bold hover:underline text-sm"
                            >
                                Go to Stock Movement to restock these items →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- PRODUCT MANAGER ---

const ProductManager = ({ getConfig }) => {
    const [p, setP] = useState([]);
    const [cats, setCats] = useState([]);
    const [sups, setSups] = useState([]);
    const [f, setF] = useState({ name: '', category: '', price: 0, sku: '', quantity: 0, image: '', supplier: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const loadAll = useCallback(async () => {
        try {
            const resP = await axios.get(`${API_URL}/products`, getConfig()); 
            const resC = await axios.get(`${API_URL}/categories`, getConfig());
            const resS = await axios.get(`${API_URL}/suppliers`, getConfig());
            setP(resP.data); setCats(resC.data); setSups(resS.data);
        } catch (err) { console.error("Load all products error", err); }
    }, [getConfig]);

    useEffect(() => { loadAll(); }, [loadAll]);

    const save = async (e) => {
        e.preventDefault();
        await axios.post(`${API_URL}/products`, f, getConfig());
        loadAll(); 
        setF({ name: '', category: '', price: 0, sku: '', quantity: 0, image: '', supplier: '' });
    };

    const deleteProd = async (id) => {
        if(window.confirm("Permanently delete this product?")) {
            await axios.delete(`${API_URL}/products/${id}`, getConfig());
            loadAll();
        }
    };

    const filteredProducts = p.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <h2 className="font-bold text-2xl text-blue-600">Product Management</h2>
            <form onSubmit={save} className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-600 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input className="border p-2 rounded" placeholder="Name" value={f.name} onChange={e => setF({...f, name: e.target.value})} required />
                <input className="border p-2 rounded" placeholder="SKU" value={f.sku} onChange={e => setF({...f, sku: e.target.value})} required />
                <select className="border p-2 rounded" value={f.category} onChange={e => setF({...f, category: e.target.value})} required>
                    <option value="">Category</option>
                    {cats.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
                <select className="border p-2 rounded" value={f.supplier} onChange={e => setF({...f, supplier: e.target.value})} required>
                    <option value="">Supplier</option>
                    {sups.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
                <input className="border p-2 rounded" type="number" placeholder="Price" value={f.price || ''} onChange={e => setF({...f, price: e.target.value})} required />
                <input className="border p-2 rounded" type="number" placeholder="Initial Qty" value={f.quantity || ''} onChange={e => setF({...f, quantity: e.target.value})} required />
                <input className="border p-2 rounded md:col-span-2" placeholder="Image URL" value={f.image} onChange={e => setF({...f, image: e.target.value})} />
                <button className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition md:col-span-4 shadow">Add Product</button>
            </form>

            <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow border-b">
                    <span className="font-bold text-blue-600 text-xl">Inventory List</span>
                    <input className="border border-blue-400 p-2 rounded w-48 shadow-inner focus:outline-none focus:border-blue-600 text-sm" placeholder="Search..." onChange={e => setSearchTerm(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredProducts.map(x => (
                        <div key={x._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition relative border border-slate-200 group flex flex-col">
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                {x.image ? (
                                    <img 
                                        src={x.image} 
                                        alt={x.name} 
                                        className="w-full h-full object-cover transition duration-300 group-hover:scale-110" 
                                        referrerPolicy="no-referrer" 
                                        onError={e => e.target.src='https://via.placeholder.com/150'}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full"><ImageIcon className="text-slate-300" size={24}/></div>
                                )}
                                <button 
                                    onClick={() => deleteProd(x._id)} 
                                    className="absolute top-1 right-1 bg-white/80 p-1.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                            <div className="p-2 flex flex-col flex-grow">
                                <h3 className="font-bold text-slate-700 text-xs truncate" title={x.name}>{x.name}</h3>
                                <p className="text-[9px] font-mono text-slate-400 truncate">{x.sku}</p>
                                <div className="mt-auto pt-2 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Qty</span>
                                    <span className={`text-xs font-black ${x.quantity < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                        {x.quantity}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- CATEGORY MANAGER ---

const CategoryManager = ({ getConfig }) => {
    const [cats, setCats] = useState([]);
    const [n, setN] = useState('');

    const load = useCallback(async () => { 
        const r = await axios.get(`${API_URL}/categories`, getConfig()); 
        setCats(r.data); 
    }, [getConfig]);

    useEffect(() => { load(); }, [load]);

    const add = async () => { if(!n) return; await axios.post(`${API_URL}/categories`, { name: n }, getConfig()); setN(''); load(); };
    const del = async (id) => { if(window.confirm("Delete category?")) { await axios.delete(`${API_URL}/categories/${id}`, getConfig()); load(); } };

    return (
        <div className="space-y-6">
            <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg mb-8">
                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Warehouse" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent flex items-center px-12">
                    <h2 className="text-4xl font-black text-white tracking-tight uppercase">Category <span className="text-blue-400">Control</span></h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 shadow-xl rounded-2xl border-t-4 border-blue-600 h-fit">
                    <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                        <Plus size={20} className="text-blue-600"/> Create New Category
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">Group your products by adding unique classification tags.</p>
                    <div className="space-y-4">
                        <input className="border-2 border-slate-100 p-3 w-full rounded-xl focus:border-blue-500 outline-none transition shadow-sm" 
                               value={n} placeholder="e.g. Electronics, Home Decor" onChange={e => setN(e.target.value)} />
                        <button onClick={add} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                            Add Category
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-8 shadow-xl rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-slate-800">Existing Categories</h3>
                        <span className="bg-blue-100 text-blue-600 text-xs font-black px-3 py-1 rounded-full uppercase">{cats.length} Total</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                        {cats.map(c => (
                            <div key={c._id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center group hover:bg-white hover:border-blue-400 hover:shadow-md transition cursor-default">
                                <span className="font-bold text-slate-700 tracking-tight"># {c.name}</span>
                                <button onClick={() => del(c._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUPPLIER MANAGER ---

const SupplierManager = ({ getConfig }) => {
    const [s, setS] = useState([]);
    const [f, setF] = useState({ name: '', contact: '' });

    const load = useCallback(async () => { 
        const r = await axios.get(`${API_URL}/suppliers`, getConfig()); 
        setS(r.data); 
    }, [getConfig]);

    useEffect(() => { load(); }, [load]);

    const add = async () => { if(!f.name) return; await axios.post(`${API_URL}/suppliers`, f, getConfig()); setF({name:'', contact:''}); load(); };
    const del = async (id) => { if(window.confirm("Remove supplier?")) { await axios.delete(`${API_URL}/suppliers/${id}`, getConfig()); load(); } };

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 shadow-xl rounded-2xl border-l-8 border-blue-600">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="font-black text-3xl text-blue-600 uppercase tracking-tighter">Supplier Directory</h2>
                        <p className="text-slate-500">Manage your global vendor network and contacts.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <input className="border p-2 rounded-lg text-sm outline-none focus:ring-2 ring-blue-500/20" placeholder="Vendor Name" value={f.name} onChange={e => setF({...f, name: e.target.value})} />
                        <input className="border p-2 rounded-lg text-sm outline-none focus:ring-2 ring-blue-500/20" placeholder="Email or Phone" value={f.contact} onChange={e => setF({...f, contact: e.target.value})} />
                        <button onClick={add} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition shadow-lg">Register</button>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-blue-600 text-white uppercase text-[11px] font-black tracking-widest">
                        <tr>
                            <th className="p-5">Supplier Name</th>
                            <th className="p-5">Contact Details</th>
                            <th className="p-5 text-center">Status</th>
                            <th className="p-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {s.map(x => (
                            <tr key={x._id} className="hover:bg-blue-50/50 transition">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{x.name.charAt(0)}</div>
                                        <span className="font-bold text-slate-700">{x.name}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-slate-500 font-medium text-sm">{x.contact}</td>
                                <td className="p-5 text-center">
                                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">Verified</span>
                                </td>
                                <td className="p-5 text-right">
                                    <button onClick={() => del(x._id)} className="p-2 text-red-200 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                                        <Trash2 size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {s.length === 0 && <div className="p-20 text-center text-slate-400 italic">No suppliers found in directory.</div>}
            </div>
        </div>
    );
};

// --- STOCK MOVEMENT ---

const StockMovement = ({ getConfig }) => {
    const [p, setP] = useState([]);
    const [m, setM] = useState({ productId: '', quantity: 0, type: 'IN' });

    useEffect(() => { 
        axios.get(`${API_URL}/products`, getConfig()).then(r => setP(r.data)); 
    }, [getConfig]);
    
    const update = async () => { 
        if (!m.productId || m.quantity <= 0) return alert("Select product and valid quantity");
        await axios.post(`${API_URL}/stock-update`, m, getConfig()); 
        alert("Stock Recorded!"); window.location.reload(); 
    };

    return (
        <div className="flex flex-col lg:flex-row bg-white rounded-3xl overflow-hidden shadow-2xl min-h-[600px]">
            <div className="lg:w-1/2 p-12 flex items-center justify-center">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h3 className="text-4xl font-bold text-blue-600">Record Transaction</h3>
                        <p className="text-slate-400 text-sm">Update the physical count of your items.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Product</label>
                            <select className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition" 
                                    onChange={e => setM({...m, productId: e.target.value})}>
                                <option value="">-- Search Inventory --</option>
                                {p.map(x => <option key={x._id} value={x._id}>{x.name} (Current: {x.quantity})</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setM({...m, type: 'IN'})} 
                                        className={`p-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${m.type==='IN' ? 'bg-green-500 text-white shadow-lg ring-4 ring-green-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                    <span className="font-black text-xl">+</span>
                                    <span className="text-xs font-bold uppercase">Stock IN</span>
                                </button>
                                <button onClick={() => setM({...m, type: 'OUT'})} 
                                        className={`p-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${m.type==='OUT' ? 'bg-red-500 text-white shadow-lg ring-4 ring-red-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                    <span className="font-black text-xl">-</span>
                                    <span className="text-xs font-bold uppercase">Stock OUT</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</label>
                            <input type="number" placeholder="0" className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl text-xl font-black text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition" 
                                   onChange={e => setM({...m, quantity: parseInt(e.target.value)})} />
                        </div>

                        <button onClick={update} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-1">
                            COMPLETE TRANSACTION
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:w-1/2 relative bg-slate-900">
                <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1000" 
                     className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Logistics" />
                <div className="relative h-full flex flex-col justify-center p-16 text-white">
                    <span className="bg-blue-600 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full w-fit mb-4">Internal Logistics</span>
                    <h2 className="text-5xl font-black mb-4">Stock <br/><span className="text-blue-400">Movement.</span></h2>
                    <p className="text-slate-300 max-w-sm leading-relaxed">Ensure accurate inventory tracking by recording every stock addition or withdrawal from the warehouse.</p>
                </div>
            </div>
        </div>
    );
};

// --- REPORTS ---

const Reports = ({ getConfig }) => {
    const [l, setL] = useState([]);

    useEffect(() => { 
        axios.get(`${API_URL}/transactions`, getConfig()).then(r => setL(r.data)); 
    }, [getConfig]);

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
                <h2 className="text-2xl font-bold text-blue-600">Operational Audit Logs</h2>
                <button onClick={downloadCSV} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue shadow-lg">
                    📥 Download Report (CSV)
                </button>
            </div>
            <div className="bg-white shadow rounded-xl overflow-hidden border">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="p-4">Timestamp</th><th className="p-4">Item</th><th className="p-4">Action</th><th className="p-4">Qty</th><th className="p-4">User</th>
                        </tr>
                    </thead>
                    <tbody>{l.map(x => (
                        <tr key={x._id} className="border-b text-sm">
                            <td className="p-4 text-gray-500">{new Date(x.date).toLocaleString()}</td>
                            <td className="p-4 font-bold uppercase">{x.productName}</td>
                            <td className="p-4 text-xs">
                                <span className={`px-2 py-1 rounded font-black uppercase ${x.type === 'IN' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                                    {x.type}
                                </span>
                            </td>
                            <td className="p-4 font-mono font-bold">{x.quantity}</td>
                            <td className="p-4 text-gray-400 italic text-xs uppercase">{x.user}</td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
};

export default App;
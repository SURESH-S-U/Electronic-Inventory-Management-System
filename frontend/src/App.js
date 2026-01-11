import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Box, ArrowUpDown, FileText, LogOut, Tags, Truck, Image as ImageIcon, AlertTriangle, Activity, Trash2 } from 'lucide-react';
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
                    <nav className="w-64 bg-blue-900 text-white p-6 flex flex-col space-y-4 font-sans shadow-xl">
                        <h1 className="text-xl font-bold text-blue-400 mb-6 uppercase tracking-widest border-b border-gray-700 pb-2">E-Inventory</h1>
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




// --- ENHANCED DASHBOARD WITH CLICKABLE LOW STOCK ---

const Dashboard = ({ getConfig }) => {
    const [data, setData] = useState({ p: [], c: [], s: [], t: [] });
    const [showLowStockModal, setShowLowStockModal] = useState(false); // State to control Modal

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
    }, []);

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

                {/* CLICKABLE LOW STOCK CARD */}
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

            {/* CHARTS */}
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

            {/* --- LOW STOCK MODAL POPUP --- */}
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

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const resP = await axios.get(`${API_URL}/products`, getConfig()); 
            const resC = await axios.get(`${API_URL}/categories`, getConfig());
            const resS = await axios.get(`${API_URL}/suppliers`, getConfig());
            setP(resP.data); setCats(resC.data); setSups(resS.data);
        } catch (err) { console.error("Load all products error", err); }
    };

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

            <div className="bg-white shadow rounded-xl overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <span className="font-bold text-slate-800 text-[25  px]">Inventory List</span>
                    <input className="border border-blue-400 p-2 rounded text-mm w-48 shadow-inner 
             focus:outline-none focus:border-blue-1000 focus:bg-gray-400" placeholder="Search product..." onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-white text-[10px] uppercase font-black">
                        <tr><th className="p-4 text-center">Img</th><th className="p-4">Name</th><th className="p-4">SKU</th><th className="p-4">Stock</th><th className="p-4 text-center">Delete</th></tr>
                    </thead>
                    <tbody>{filteredProducts.map(x => (
                        <tr key={x._id} className="border-b hover:bg-gray-50 transition">
                            <td className="p-4 flex justify-center">
                                {x.image ? <img src={x.image} alt="p" className="w-10 h-10 rounded object-cover border-2 border-white shadow-sm" referrerPolicy="no-referrer" onError={e => e.target.src='https://via.placeholder.com/40'}/> : <ImageIcon className="text-gray-200" size={20}/>}
                            </td>
                            <td className="p-4 font-bold text-slate-700">{x.name}</td>
                            <td className="p-4 font-mono text-xs text-slate-400 italic">{x.sku}</td>
                            <td className={`p-4 font-black ${x.quantity < 5 ? 'text-red-500 underline underline-offset-4 decoration-dotted' : 'text-green-600'}`}>{x.quantity}</td>
                            <td className="p-4 text-center">
                                <button onClick={() => deleteProd(x._id)} className="text-red-400 hover:text-red-600 hover:scale-110 transition duration-200"><Trash2 size={18}/></button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
};




// --- CATEGORY MANAGER ---
const CategoryManager = ({ getConfig }) => {
    const [cats, setCats] = useState([]);
    const [n, setN] = useState('');
    useEffect(() => { load(); }, []);
    const load = async () => { const r = await axios.get(`${API_URL}/categories`, getConfig()); setCats(r.data); };
    const add = async () => { if(!n) return; await axios.post(`${API_URL}/categories`, { name: n }, getConfig()); setN(''); load(); };
    const del = async (id) => { if(window.confirm("Delete category?")) { await axios.delete(`${API_URL}/categories/${id}`, getConfig()); load(); } };

    return (
        <div className="max-w-xl bg-white p-8 shadow rounded-xl border-t-4 border-blue-700">
            <h2 className="font-bold text-xl mb-4 text-blue-600 border-b pb-2 tracking-tight">Manage Categories</h2>
            <div className="flex gap-2 mb-6">
                <input className="border p-2 flex-1 rounded shadow-inner" value={n} placeholder="E.g. Audio, Mobiles" onChange={e => setN(e.target.value)} />
                <button onClick={add} className="bg-blue-600 text-white px-6 rounded font-bold hover:bg-blue-700 shadow transition">Add</button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {cats.map(c => (
                    <div key={c._id} className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center group hover:border-blue-400 transition">
                        <span className="font-medium text-slate-600 italic"># {c.name}</span>
                        <button onClick={() => del(c._id)} className="text-red-300 hover:text-red-600 transition"><Trash2 size={16}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};



// --- SUPPLIER MANAGER ---
const SupplierManager = ({ getConfig }) => {
    const [s, setS] = useState([]);
    const [f, setF] = useState({ name: '', contact: '' });
    useEffect(() => { load(); }, []);
    const load = async () => { const r = await axios.get(`${API_URL}/suppliers`, getConfig()); setS(r.data); };
    const add = async () => { if(!f.name) return; await axios.post(`${API_URL}/suppliers`, f, getConfig()); setF({name:'', contact:''}); load(); };
    const del = async (id) => { if(window.confirm("Remove supplier?")) { await axios.delete(`${API_URL}/suppliers/${id}`, getConfig()); load(); } };

    return (
        <div className="bg-white p-8 shadow rounded-xl max-w-2xl border-t-8 border-blue-800">
            <h2 className="font-bold text-xl mb-6 text-blue-600 border-b pb-2 tracking-tighter">Supplier Directory</h2>
            <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-lg border">
                <input className="border p-2 rounded" placeholder="Vendor Name" value={f.name} onChange={e => setF({...f, name: e.target.value})} />
                <input className="border p-2 rounded" placeholder="Contact Details" value={f.contact} onChange={e => setF({...f, contact: e.target.value})} />
                <button onClick={add} className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue col-span-2 shadow-md transition">Register New Supplier</button>
            </div>
            <table className="w-full text-left">
                <thead className="border-b uppercase text-[10px] text-gray-400 font-black tracking-widest">
                    <tr><th className="pb-2">Name</th><th className="pb-2">Contact Info</th><th className="pb-2 text-right">Action</th></tr>
                </thead>
                <tbody>{s.map(x => (
                    <tr key={x._id} className="border-b hover:bg-slate-50 transition duration-150">
                        <td className="py-3 font-bold text-slate-700">{x.name}</td>
                        <td className="text-slate-500 font-medium">{x.contact}</td>
                        <td className="text-right">
                            <button onClick={() => del(x._id)} className="text-red-300 hover:text-red-600 transition hover:rotate-12"><Trash2 size={16}/></button>
                        </td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
};

// --- REMAINING AUTH & FUNCTIONAL COMPONENTS ---

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



// Stock Movement

const StockMovement = ({ getConfig }) => {
    const [p, setP] = useState([]);
    const [m, setM] = useState({ productId: '', quantity: 0, type: 'IN' });
    useEffect(() => { axios.get(`${API_URL}/products`, getConfig()).then(r => setP(r.data)); }, []);
    const update = async () => { 
        if (!m.productId || m.quantity <= 0) return alert("Select product and valid quantity");
        await axios.post(`${API_URL}/stock-update`, m, getConfig()); 
        alert("Stock Recorded!"); window.location.reload(); 
    };
    return (
        <div className="bg-white p-8 shadow-xl rounded-2xl max-w-md mx-auto border-t-8 border-blue-800">
            <h2 className="font-bold text-2xl mb-6 text-center text-blue-600">Update Stock</h2>
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Item</label>
                <select className="border p-3 w-full rounded-lg bg-slate-50 shadow-inner" onChange={e => setM({...m, productId: e.target.value})}>
                    <option value="">-- Choose Target Product --</option>
                    {p.map(x => <option key={x._id} value={x._id}>{x.name} (Current: {x.quantity})</option>)}
                </select>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action</label>
                <div className="flex gap-2">
                    <button onClick={() => setM({...m, type: 'IN'})} className={`flex-1 p-2 rounded font-bold transition ${m.type==='IN' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>Stock IN (+)</button>
                    <button onClick={() => setM({...m, type: 'OUT'})} className={`flex-1 p-2 rounded font-bold transition ${m.type==='OUT' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>Stock OUT (-)</button>
                </div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity</label>
                <input type="number" placeholder="Enter Amount" className="border p-3 w-full rounded-lg shadow-inner" onChange={e => setM({...m, quantity: parseInt(e.target.value)})} />
                <button onClick={update} className="bg-blue-600 text-white w-full p-4 rounded-xl font-black text-lg shadow-lg hover:bg-blue transition mt-4">RECORD TRANSACTION</button>
            </div>
        </div>
    );
};


// Reports page

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
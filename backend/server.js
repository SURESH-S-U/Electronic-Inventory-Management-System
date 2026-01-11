const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { User, Product, Transaction, Category, Supplier } = require('./models/Models');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Atlas Connected"));

// Auth Middleware
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send("Access Denied");
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) { res.status(400).send("Invalid Token"); }
};

// --- AUTH ---
app.post('/api/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await new User({ username: req.body.username, password: hashedPassword }).save();
    res.json("Success");
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !await bcrypt.compare(req.body.password, user.password)) return res.status(400).send("Error");
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token, username: user.username });
});

// --- BULK ROUTES ---
app.post('/api/bulk/:type', authenticate, async (req, res) => {
    const { type } = req.params;
    const data = req.body.map(item => ({ ...item, ownerId: req.user.id }));
    try {
        if (type === 'products') await Product.insertMany(data);
        if (type === 'categories') await Category.insertMany(data);
        if (type === 'suppliers') await Supplier.insertMany(data);
        res.json("Bulk Upload Success");
    } catch (err) { res.status(400).send("Bulk Upload Failed. Check data."); }
});

// --- SINGLE ROUTES ---
app.get('/api/products', authenticate, async (req, res) => res.json(await Product.find({ ownerId: req.user.id })));
app.post('/api/products', authenticate, async (req, res) => res.json(await new Product({ ...req.body, ownerId: req.user.id }).save()));

app.get('/api/categories', authenticate, async (req, res) => res.json(await Category.find({ ownerId: req.user.id })));
app.post('/api/categories', authenticate, async (req, res) => res.json(await new Category({ ...req.body, ownerId: req.user.id }).save()));

app.get('/api/suppliers', authenticate, async (req, res) => res.json(await Supplier.find({ ownerId: req.user.id })));
app.post('/api/suppliers', authenticate, async (req, res) => res.json(await new Supplier({ ...req.body, ownerId: req.user.id }).save()));

// --- STOCK UPDATE ---
app.post('/api/stock-update', authenticate, async (req, res) => {
    const { productId, quantity, type } = req.body;
    const p = await Product.findOne({ _id: productId, ownerId: req.user.id });
    p.quantity += (type === 'IN' ? quantity : -quantity);
    await p.save();
    await new Transaction({ productName: p.name, type, quantity, user: req.user.username, ownerId: req.user.id }).save();
    res.json("Updated");
});

app.get('/api/transactions', authenticate, async (req, res) => res.json(await Transaction.find({ ownerId: req.user.id }).sort({ date: -1 })));

app.listen(5000, () => console.log("Server Running"));
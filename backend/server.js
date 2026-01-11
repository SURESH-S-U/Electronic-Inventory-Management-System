const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { User, Product, Transaction } = require('./models/Models');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashedPassword, role: req.body.role });
    await user.save();
    res.json({ message: "User Created" });
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, role: user.role, username: user.username });
});

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/api/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
});

// --- STOCK IN/OUT ROUTE ---
app.post('/api/stock-update', async (req, res) => {
    const { productId, quantity, type, user } = req.body;
    const product = await Product.findById(productId);
    
    if (type === 'OUT' && product.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
    }

    product.quantity += (type === 'IN' ? quantity : -quantity);
    await product.save();

    const transaction = new Transaction({ productId, productName: product.name, type, quantity, user });
    await transaction.save();
    
    res.json({ message: "Stock Updated" });
});

// --- REPORTS ROUTE ---
app.get('/api/transactions', async (req, res) => {
    const logs = await Transaction.find().sort({ date: -1 });
    res.json(logs);
});

app.listen(5000, () => console.log("Server running on port 5000"));
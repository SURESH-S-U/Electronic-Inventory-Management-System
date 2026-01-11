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

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"));

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send("Access Denied");
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).send("Invalid Token"); }
};

app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ username: req.body.username, password: hashedPassword });
        await user.save();
        res.json({ message: "Success" });
    } catch (err) { res.status(400).send("User already exists"); }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !await bcrypt.compare(req.body.password, user.password)) return res.status(400).send("Wrong details");
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token, username: user.username });
});

app.get('/api/products', authenticate, async (req, res) => {
    res.json(await Product.find({ ownerId: req.user.id }));
});

app.post('/api/products', authenticate, async (req, res) => {
    const newObj = { ...req.body, ownerId: req.user.id };
    res.json(await new Product(newObj).save());
});

app.get('/api/categories', authenticate, async (req, res) => {
    res.json(await Category.find({ ownerId: req.user.id }));
});

app.post('/api/categories', authenticate, async (req, res) => {
    res.json(await new Category({ ...req.body, ownerId: req.user.id }).save());
});

app.get('/api/suppliers', authenticate, async (req, res) => {
    res.json(await Supplier.find({ ownerId: req.user.id }));
});

app.post('/api/suppliers', authenticate, async (req, res) => {
    res.json(await new Supplier({ ...req.body, ownerId: req.user.id }).save());
});

app.post('/api/stock-update', authenticate, async (req, res) => {
    const { productId, quantity, type } = req.body;
    const product = await Product.findOne({ _id: productId, ownerId: req.user.id });
    product.quantity += (type === 'IN' ? quantity : -quantity);
    await product.save();
    await new Transaction({ productName: product.name, type, quantity, user: req.user.username, ownerId: req.user.id }).save();
    res.json({ message: "Updated" });
});

app.get('/api/transactions', authenticate, async (req, res) => {
    res.json(await Transaction.find({ ownerId: req.user.id }).sort({ date: -1 }));
});



// --- DELETE ROUTES ---

app.delete('/api/products/:id', authenticate, async (req, res) => {
    try {
        await Product.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
        res.json({ message: "Product Deleted" });
    } catch (err) { res.status(500).send("Error deleting product"); }
});

app.delete('/api/categories/:id', authenticate, async (req, res) => {
    try {
        await Category.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
        res.json({ message: "Category Deleted" });
    } catch (err) { res.status(500).send("Error deleting category"); }
});

app.delete('/api/suppliers/:id', authenticate, async (req, res) => {
    try {
        await Supplier.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
        res.json({ message: "Supplier Deleted" });
    } catch (err) { res.status(500).send("Error deleting supplier"); }
});



// Run server

app.listen(5000, () => console.log("Multi-tenant Server Running"));
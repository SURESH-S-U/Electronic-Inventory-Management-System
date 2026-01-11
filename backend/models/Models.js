const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Staff'], default: 'Staff' }
});

const ProductSchema = new mongoose.Schema({
    name: String,
    category: String,
    quantity: { type: Number, default: 0 },
    price: Number,
    supplier: String,
    sku: String,
    minStock: { type: Number, default: 5 }
});

const TransactionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    type: { type: String, enum: ['IN', 'OUT'] },
    quantity: Number,
    user: String,
    date: { type: Date, default: Date.now }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Product: mongoose.model('Product', ProductSchema),
    Transaction: mongoose.model('Transaction', TransactionSchema)
};
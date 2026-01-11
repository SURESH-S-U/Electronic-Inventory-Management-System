const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Admin' }
});

const ProductSchema = new mongoose.Schema({
    name: String,
    category: String,
    quantity: { type: Number, default: 0 },
    price: Number,
    supplier: String,
    sku: String,
    minStock: { type: Number, default: 5 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Ownership link
});

const CategorySchema = new mongoose.Schema({
    name: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Ownership link
});

const SupplierSchema = new mongoose.Schema({
    name: String,
    contact: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Ownership link
});

const TransactionSchema = new mongoose.Schema({
    productName: String,
    type: { type: String, enum: ['IN', 'OUT'] },
    quantity: Number,
    user: String,
    date: { type: Date, default: Date.now },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Ownership link
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Product: mongoose.model('Product', ProductSchema),
    Category: mongoose.model('Category', CategorySchema),
    Supplier: mongoose.model('Supplier', SupplierSchema),
    Transaction: mongoose.model('Transaction', TransactionSchema)
};
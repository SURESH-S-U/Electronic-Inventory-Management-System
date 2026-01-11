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
    image: String, // Added image field
    minStock: { type: Number, default: 5 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Added ownership
});

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Added ownership
});

const SupplierSchema = new mongoose.Schema({
    name: String,
    contact: String,
    email: String,
    address: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Added ownership
});

const TransactionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    type: { type: String, enum: ['IN', 'OUT'] },
    quantity: Number,
    user: String,
    date: { type: Date, default: Date.now },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Added ownership
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Product: mongoose.model('Product', ProductSchema),
    Category: mongoose.model('Category', CategorySchema),
    Supplier: mongoose.model('Supplier', SupplierSchema),
    Transaction: mongoose.model('Transaction', TransactionSchema)
};
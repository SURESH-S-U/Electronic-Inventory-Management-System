# 📦 E-Inventory Management System

A professional, multi-tenant Inventory Management System built with the **MERN** stack (MongoDB, Express, React, Node.js). This application features a real-time dashboard, stock movement tracking, and automated audit logs.

---

## 🚀 Key Features

- **Multi-Tenant Auth:** Secure Login/Register (one user cannot see another's data).
- **Interactive Dashboard:** Data visualization with Bar and Pie charts.
- **Low Stock Alerts:** Clickable notification system for items below threshold.
- **Product Management:** Complete CRUD with SKU and Image support.
- **Category & Supplier Tracking:** Keep your database organized.
- **Audit Trail:** Logs every "Stock IN" and "Stock OUT" transaction.
- **Report Export:** Download transaction logs as a CSV file.

---

## 🛠 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide-React (Icons), Recharts (Graphs), Axios.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose.
- **Security:** JWT (JSON Web Tokens) & Bcrypt.js.

---

## ⚙️ Full Setup & Installation Commands

### 1. Initialize Project & Backend Setup
```cmd
# Create the project folder
#Create a backend folder

# Initialize Node.js
npm init -y

# Install Backend Libraries
npm install express mongoose cors bcryptjs jsonwebtoken dotenv

# Install Development Tool (Optional)
npm install --save-dev nodemon


### 2. Initialize Project & Frontend Setup
```cmd

# Install React and Routing
npm install react react-dom react-router-dom react-scripts

# Install UI & Data Libraries
npm install axios lucide-react recharts


.env config
MONGO_URI=mongodb: your connection string
JWT_SECRET= random key

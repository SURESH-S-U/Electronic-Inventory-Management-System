# 📦 E-Inventory Management System

A professional, multi-tenant Inventory Management System built with the MERN stack (MongoDB, Express, React, Node.js). The application provides secure authentication, real-time dashboards, stock movement tracking, and automated audit logs.

---

## 🚀 Key Features

- Multi-tenant authentication using JWT (each user can access only their own data)
- Interactive dashboard with bar and pie charts
- Low stock alert system with clickable notifications
- Product management with full CRUD operations, SKU, and image support
- Category and supplier management
- Audit trail for every Stock IN and Stock OUT transaction
- CSV export for transaction and stock reports

---

## 🛠 Tech Stack

Frontend: React.js, Tailwind CSS, Axios, Recharts, Lucide-React, React Router DOM  
Backend: Node.js, Express.js  
Database: MongoDB, Mongoose  
Security: JWT (JSON Web Tokens), Bcrypt.js

---

## 📁 Project Structure

E-Inventory-Management-System  
├── backend  
│   ├── models  
│   ├── controllers  
│   ├── routes  
│   ├── middleware  
│   ├── config  
│   ├── server.js  
│   └── .env  
├── frontend  
│   ├── src  
│   │   ├── components  
│   │   ├── pages  
│   │   ├── services  
│   │   ├── App.js  
│   │   └── main.jsx  
│   └── package.json  
├── .gitignore  
└── README.md

---

## ⚙️ Installation & Setup


# Step 1: Backend setup

npm init -y  
npm install express mongoose cors bcryptjs jsonwebtoken dotenv  
npm i nodemon

# Step 2: Create environment file (backend/.env)

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/inventoryDB  
JWT_SECRET=inventory_jwt_secure_key_2026  
PORT=5000

Start backend server

nodemon server.js

# Step 3: Frontend setup

npx create-react-app@latest frontend  
 
npm install react-router-dom axios lucide-react recharts  
npm start

---

## 🔐 Authentication Flow

User registers → password is hashed using bcrypt  
User logs in → JWT token is generated  
JWT token is stored on the client  
Token is sent in request headers  
Backend verifies token before serving protected routes

---

## 📊 Dashboard Overview

- Total products count
- Low stock items
- Stock IN and Stock OUT history
- Category-wise analytics
- Supplier-based reports

---

## 📄 CSV Export

Users can export transaction logs and inventory reports as CSV files directly from the dashboard.

---

## 🚧 Future Enhancements

- Role-based access control (Admin / Staff)
- Email notifications for low stock
- Barcode and QR code scanning
- Dark mode support
- Cloud-based image storage integration

---



## Backend Live 
Available at your primary URL https://electronic-inventory-management-system.onrender.com


## Frontend Live




## 🧑‍💻 Author

Suresh S U  
AI & Data Science Student  
Full Stack Developer  

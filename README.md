E-Commerce Marketplace Backend

## 📌 Overview
This project is a backend system for an **E-Commerce Marketplace**, where users can browse products, manage carts, and place orders. Sellers can list and update products, while authentication ensures secure access.

## 🚀 Features
### ✅ Core Features
1. **User Authentication & Profiles**
   - JWT authentication
   - Buyers can manage carts and place orders.
   - Sellers can manage their products.
2. **Product Management**
   - Sellers can create, update, and delete products.
   - Users can fetch and search products by category and price.
3. **Shopping Cart & Checkout**
   - Users can add, update, and remove items from the cart.
   - Total price is calculated automatically.
4. **Order Management**
   - Users can place orders.
   - Orders are stored in the database.

### 🎯 Bonus Features
- **[Future] Discount/Coupon Feature**
- **[Future] Webhook Notifications for Order Status Changes**

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT

## 📂 Folder Structure
```
/e-commerce-backend
│── /src
│   ├── /config          # Database and environment configurations
│   ├── /controllers     # API logic and handlers
│   ├── /middleware      # Authentication & authorization logic
│   ├── /models          # MongoDB models (User, Product, Order, Cart)
│   ├── /routes          # API routes
│   ├── /utils           # Utility functions
│── /tests               # Test scripts
│── .env                 # Environment variables
│── server.js            # Main entry point
│── README.md            # Project documentation
```

## 🔧 Setup Instructions

### 1️⃣ Install Dependencies
```sh
npm install
```

### 2️⃣ Configure Environment Variables
Create a `.env` file in the root directory and add:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 3️⃣ Start the Server
```sh
node server.js
```
Server will run at: `http://localhost:5000`

## 🔍 API Endpoints

### **User Authentication**
| Method | Endpoint         | Description         |
|--------|----------------|---------------------|
| POST   | `/api/users/register` | Register a new user |
| POST   | `/api/users/login` | Login & get JWT token |

### **Product Management**
| Method | Endpoint       | Description      |
|--------|--------------|----------------|
| POST   | `/api/products` | Create a new product (Seller only) |
| GET    | `/api/products` | Fetch all products |

### **Cart & Orders**
| Method | Endpoint       | Description      |
|--------|--------------|----------------|
| POST   | `/api/cart` | Add product to cart |
| GET    | `/api/cart` | Get cart items |
| POST   | `/api/orders` | Place an order |
| GET    | `/api/orders` | Fetch user orders |

## 🧪 Testing
### Run test script to check all APIs:
```sh
node testBackend.js
```

Contributed by:
Ojasvi
23BBS0012

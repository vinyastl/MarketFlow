# ShopMERN

A full-stack e-commerce web application built with the **MERN stack** (MongoDB, Express, React, Node.js). Features user authentication, a product catalog, a shopping cart, and a mock Stripe-style checkout flow.

##  Features

-  **JWT authentication** (signup, login, protected routes)
-  **Shopping cart** with localStorage persistence
-  **Product catalog** with category filtering and detail pages
-  **Mock payment flow** that simulates Stripe-style card validation (no Stripe account needed)
-  **Order history** with order detail pages
-  **Dual database mode**: works with MongoDB (Atlas or local) OR a built-in in-memory store for zero-setup demos
-  **Responsive design** with a clean, warm aesthetic

##  Tech Stack

**Backend**
- Node.js + Express (REST API)
- Mongoose (MongoDB ODM)
- JWT for authentication
- bcryptjs for password hashing
- CORS, Morgan for middleware

**Frontend**
- React 18 (with Vite for fast dev/build)
- React Router for client-side routing
- Axios for API calls
- Context API for auth and cart state

##  Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) MongoDB Atlas account or local MongoDB. Skip this and the app uses an in-memory database.

### 1. Clone

```bash
git clone https://github.com/Anjaligarikapati/mern-ecommerce.git
cd mern-ecommerce
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env if you want to use MongoDB. Leave MONGODB_URI empty to use in-memory mode.
npm start
```

The API will be running at http://localhost:5000. If using in-memory mode, sample products are auto-seeded on first start.

### 3. Frontend setup (in a new terminal)

```bash
cd client
npm install
npm run dev
```

The web app will be running at http://localhost:5173.

### 4. Try it out

1. Browse the product catalog on the home page
2. Click any product to see its detail page
3. Add items to your cart
4. Click "Checkout" (you'll be prompted to sign up first)
5. Use a test card like `4242 4242 4242 4242` (any card NOT ending in `0000` will succeed)
6. Cards ending in `0000` are declined to demo the failure path
7. View your order in the "Orders" tab

## 📂 Project Structure

```
mern-ecommerce/
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # MongoDB connection + in-memory fallback
│   │   │   └── memoryDB.js     # In-memory database implementation
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   └── Order.js
│   │   ├── routes/
│   │   │   ├── auth.js         # Signup, login
│   │   │   ├── products.js     # Product listing and detail
│   │   │   └── orders.js       # Checkout and order history
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verification
│   │   ├── utils/
│   │   │   ├── seed.js         # Manual seed script
│   │   │   └── autoSeed.js     # Auto-seed for memory mode
│   │   └── index.js            # Server entry point
│   ├── package.json
│   └── .env.example
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── OrderDetail.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── api/
│   │   │   └── client.js       # Axios instance with JWT interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

##  API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | Health check, returns DB mode |
| `POST` | `/api/auth/signup` | No | Create a new account |
| `POST` | `/api/auth/login` | No | Log in, returns JWT |
| `GET` | `/api/products` | No | List all products (filter by `?category=`) |
| `GET` | `/api/products/:id` | No | Get a single product |
| `GET` | `/api/orders` | Yes | List current user's orders |
| `POST` | `/api/orders/checkout` | Yes | Place a new order with mock payment |
| `GET` | `/api/orders/:id` | Yes | Get a specific order |

##  Mock Payment Behavior

The checkout intentionally mimics Stripe's test-mode pattern. Card validation rules:

- Cards ending in `0000` are **declined** (use to test the failure path)
- Cards with fewer than 12 digits are **rejected as invalid**
- Any other card number is **accepted**

This makes the demo fully interactive without requiring a real Stripe account or API keys.

##  Database Modes

**In-memory mode (default)**: Leave `MONGODB_URI` empty in `.env`. The app uses a built-in in-memory store. Data resets when the server restarts. Perfect for demos.

**MongoDB Atlas (cloud)**: Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas), create a free cluster, and paste your connection string into `MONGODB_URI`.

**Local MongoDB**: Install MongoDB locally, then set `MONGODB_URI=mongodb://localhost:27017/mern-ecommerce`.

When using MongoDB, run `npm run seed` from the `server` directory to populate sample products.

##  Roadmap

- [ ] Real Stripe integration (test mode)
- [ ] Admin dashboard for product CRUD
- [ ] Image uploads
- [ ] Product reviews and ratings
- [ ] Search bar with autocomplete
- [ ] Wishlist
- [ ] Email order confirmations

##  License

MIT

##  About

Built by [Anjali Garikapati](https://github.com/Anjaligarikapati) as a portfolio project demonstrating full-stack MERN development.

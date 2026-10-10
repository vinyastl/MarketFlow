# ShopMERN — Full-Stack E-Commerce Web Application

A full-stack e-commerce web application built with the **MERN stack** (MongoDB, Express, React, Node.js). It supports user authentication, a product catalog with search and filtering, a shopping cart, and a mock Stripe-style checkout flow with order history.

> **Attribution:** This project originates from [Anjaligarikapati/mern-ecommerce](https://github.com/Anjaligarikapati/mern-ecommerce) (MIT licensed). This repository adds search & sorting, server-side validation, security hardening, an automated test suite, and deployment preparation on top of the original.

> **Important:** The checkout is **simulated**. No real payment is processed, no real card data is transmitted, and no Stripe account is needed.

## 📦 Features (verified)

- **JWT authentication** — signup, login, protected routes (bcrypt-hashed passwords)
- **Product catalog** — listing, detail pages, category filter, **text search (`q`)**, and **sorting** (price low→high / high→low, top rated, newest)
- **Shopping cart** — persisted in `localStorage`, quantity management, totals
- **Mock payment flow** — simulates Stripe-style card validation without a Stripe account:
  - Cards ending in `0000` are **declined** (tests the failure path → `402`)
  - Card numbers shorter than 12 digits are rejected as **invalid**
  - Other numbers are **accepted**
- **Order history** — order list + detail pages with line items, totals, shipping address, payment reference, and status labels
- **Order ownership** — users can only view their own orders (admin excepted)
- **Robust validation** — server-side request validation for signup, login, and checkout; client-side inline form errors
- **Dual database mode** — runs on MongoDB (Atlas or local) **or** a built-in in-memory store with zero setup
- **Health-check endpoint** — `/api/health`
- **Automated tests** — 38 passing API tests (Node's built-in test runner + Supertest)
- **Responsive design** with loading, empty, and error states

## 🧰 Tech Stack

**Backend**
- Node.js + Express (REST API, v4)
- Mongoose (MongoDB ODM)
- JWT (`jsonwebtoken`) for authentication
- `bcryptjs` for password hashing
- `helmet`, `cors`, `morgan` middleware
- Central JSON error handler — no stack traces leaked in production

**Frontend**
- React 18 + Vite 6
- React Router 7 (client-side routing)
- Axios (API calls)
- Context API for auth and cart state

**Testing**
- Node `node:test` runner + `supertest`

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) MongoDB Atlas account or a local MongoDB. Skip this and the app uses an in-memory database automatically.

### 1. Clone and install

```bash
git clone <your-repo-url> shopmern
cd shopmern
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env      # edit values as needed
npm run dev               # or: npm start
```

The API runs at **http://localhost:5000**. Leaving `MONGODB_URI` empty in `.env` enables in-memory mode (sample products auto-seed on first start; data resets on restart).

### 3. Frontend (new terminal)

```bash
cd client
npm install
npm run dev
```

The app runs at **http://localhost:5173**. The Vite dev server proxies `/api` to the backend automatically.

### 4. Try the demo flow

1. Browse the catalog on the home page
2. Use the **search box**, **category chips**, and **sort dropdown**
3. Open a product, pick a quantity, add to cart
4. Go to **Checkout** (you'll be prompted to log in first)
5. Use a test card like `4242 4242 4242 4242`
6. A card ending in `0000` is declined to demo the failure path
7. View the order in **Orders**

## 📂 Project Structure

```
shopmern/
├── server/                        # Express backend
│   ├── src/
│   │   ├── app.js                 # App factory (middleware + routes) — testable
│   │   ├── index.js               # Server bootstrap (DB connect, listen)
│   │   ├── config/
│   │   │   ├── env.js             # JWT secret resolution + warnings
│   │   │   ├── db.js              # MongoDB connection + in-memory fallback
│   │   │   └── memoryDB.js        # In-memory database implementation
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js         # includes query() for search + sort
│   │   │   └── Order.js           # includes status labels
│   │   ├── routes/
│   │   │   ├── auth.js            # Signup, login
│   │   │   ├── products.js        # List (q, category, sort), detail
│   │   │   └── orders.js          # Checkout, order history, ownership check
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   └── errorHandler.js    # JSON 404 + central error handler
│   │   └── utils/
│   │       ├── validators.js      # Server-side validation helpers
│   │       ├── asyncHandler.js    # Forwards async errors to error handler
│   │       ├── seed.js            # Manual seed script
│   │       └── autoSeed.js        # Auto-seed for memory mode
│   ├── test/                      # API tests (node:test + supertest)
│   ├── package.json
│   └── .env.example
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/            # Navbar, ProductCard
│   │   ├── pages/                 # Home, ProductDetail, Cart, Checkout,
│   │   │                          # Login, Signup, Orders, OrderDetail
│   │   ├── context/               # AuthContext, CartContext
│   │   ├── api/client.js          # Axios instance (JWT interceptor, VITE_API_URL)
│   │   ├── App.jsx / main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   └── vite.config.js
├── render.yaml                    # Optional Render.com blueprint
├── DEPLOYMENT.md                  # Step-by-step deployment guide
├── INTERVIEW_GUIDE.md             # Interview prep
├── LICENSE                        # MIT (original author)
├── .gitignore
└── README.md
```

## 🌱 Environment Variables

### Server (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Port the API listens on |
| `NODE_ENV` | `development` | `production` disables stack-trace leakage and weak-secret warnings |
| `JWT_SECRET` | — | Long random string used to sign tokens. **Required in production.** |
| `MONGODB_URI` | *(empty)* | MongoDB connection string. Empty ⇒ in-memory mode. |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin(s). Comma-separated for multiple. |

### Client (`client/.env`, copy from `client/.env.example`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | *(empty)* | Deployed backend base URL. Empty ⇒ `/api` (Vite dev proxy). |

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | No | Health check, returns DB mode |
| `POST` | `/api/auth/signup` | No | Create account — `{ name, email, password }` |
| `POST` | `/api/auth/login` | No | Log in — `{ email, password }` → `{ token, user }` |
| `GET` | `/api/products` | No | List products. Query: `category`, `q` (search), `sort` (`price_asc`, `price_desc`, `rating_desc`, `newest`) |
| `GET` | `/api/products/:id` | No | Get a single product |
| `GET` | `/api/orders` | Yes | List current user's orders (newest first) |
| `POST` | `/api/orders/checkout` | Yes | Place order — `{ items: [{productId, quantity}], shippingAddress, card }` |
| `GET` | `/api/orders/:id` | Yes | Order detail (owner/admin only) |

Errors are returned as `{ "error": "human readable message" }` with appropriate status codes (`400` validation, `401` unauth, `402` declined, `403` forbidden, `404` missing, `409` duplicate email, `500` server).

## 🧪 Tests and Verified Results

**Backend tests** (38 passing, run with `npm test` in `server/`):

- **Auth:** signup success (+ password never returned), duplicate email `409`, invalid email / short password / short name `400`, login success (case-insensitive email), wrong password / unknown email `401`, empty fields `400`
- **Products:** list, single item, `404` unknown id, category filter, name search (case-insensitive), description search, empty result, sorts (`price_asc`, `price_desc`, `rating_desc`), combined filters
- **Orders:** auth required on list & checkout, empty-cart `400`, non-integer/zero quantity `400`, missing address `400`, invalid card `400`, declined card `402`, unknown product `400`, server-side price calculation, per-user list ordering, owner access, other-user forbidden `403`, unknown order `404`
- **App:** health check, JSON `404`, malformed JSON `400`, CORS allow/deny

**Builds**
- `npm run build` in `client/` → Vite production build succeeds (255 KB JS, 6 KB CSS)
- Backend starts cleanly in memory mode and against the dev proxy

**Live API smoke test (memory mode)** — signup → login → checkout (`total = 319.97`) → order list → order detail → declined card (`402`) → unauthorized access (`403`) all verified.

> **Note:** Tests run against the in-memory database. The MongoDB path is exercised by running the app against a real cluster; it was not integration-tested here because no MongoDB instance was available in this environment.

## 🚀 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a complete guide covering:

- **Backend:** Render.com (or Railway/Render) with MongoDB Atlas
- **Frontend:** Vercel/Netlify/Render static hosting
- Exact environment variables for each platform
- Optional `render.yaml` blueprint for a one-click setup on Render

## 🔒 Security Notes (honest assessment)

Implemented: bcrypt password hashing, JWT auth with configurable secret (fail-fast in production), protected order routes with ownership checks, server-side validation of all inputs, CORS allow-list, `helmet`, body-size limits, generic error messages in production, and `.env` files excluded from Git. `npm audit` reports **0 vulnerabilities** for the client and none for the backend beyond a dev-only advisory in `nodemon`'s dependency tree (no fixed release exists yet; it only affects local file watching).

Not implemented (documented limitations): rate limiting on auth endpoints, and JWT stored in `localStorage` (the standard trade-off for a demo app — see `INTERVIEW_GUIDE.md`). Stock is displayed but **not decremented** when orders are placed.

## 📄 License

MIT — see [LICENSE](./LICENSE). Original author: [Anjali Garikapati](https://github.com/Anjaligarikapati).

## 🙌 Interview Prep

A field guide to explaining this project in interviews is in **[INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md)**.
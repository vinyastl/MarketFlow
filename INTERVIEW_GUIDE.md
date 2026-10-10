# ShopMERN — Interview Guide

A plain-English walkthrough of the actual code in this repository, written to help you explain the project confidently in an interview. Every claim here corresponds to real code you can open.

---

## 1. What problem does this application solve?

It's an online store. A visitor can browse a product catalog, search and filter it, log in or create an account, add products to a cart, "check out" with a **simulated** credit-card payment, and later view their order history. The checkout is intentionally a **mock** — it behaves like Stripe's test mode (card ending `0000` is declined) but no real payment happens and no Stripe account is needed.

**Who it's for:** a portfolio/demo project showing a complete full-stack flow — database → API → UI.

---

## 2. How does React talk to Express?

- All requests go through one Axios instance: `client/src/api/client.js`.
- Its `baseURL` is `` `${VITE_API_URL}/api` ``. In development `VITE_API_URL` is empty, so the URL is `/api`.
- A Vite dev proxy (`client/vite.config.js`) forwards `/api/*` from `http://localhost:5173` to `http://localhost:5000` (your Express server). That's why the frontend can call relative URLs in dev.
- In production you set `VITE_API_URL` to the deployed backend, e.g. `https://shopmern-api.onrender.com`, and Axios calls that directly (CORS is configured on the server).
- Axios also has a **request interceptor**: before every call it reads `token` from `localStorage` and adds an `Authorization: Bearer <token>` header if present. This is what makes protected API calls authenticated.
- Data flows as JSON: React components call `api.get(...)` / `api.post(...)`, Axios serializes the request body, Express parses it with `express.json()`, and responses are JSON objects rendered by React.

---

## 3. How do routes, controllers, and models work here?

A request travels this path:

```
HTTP request
  → Express app (server/src/app.js, middleware: helmet, cors, express.json)
  → Router for the path (server/src/routes/*.js)
  → optional auth middleware (server/src/middleware/auth.js)
  → route handler function (the "controller")
  → model method (server/src/models/*.js)
  → database (MongoDB via Mongoose, or the in-memory store)
  → JSON response
```

- **Routes** (`routes/auth.js`, `routes/products.js`, `routes/orders.js`) define the endpoints with `router.get("/", handler)`.
- **Controllers** are the handler functions — e.g. the `checkout` handler in `routes/orders.js` validates the body, calculates totals, and creates an order. In this project they're kept inside the route files for simplicity.
- **Models** (`models/User.js`, `Product.js`, `Order.js`) are not just Mongoose schemas. Each exports a plain object of async methods (`User.create`, `Product.query`, `Order.findByUser`). Every method checks `isUsingMemoryDB()` and either talks to Mongoose or to the in-memory store. This is the core idea behind the app's **dual-database mode**.
- **`asyncHandler`** (`utils/asyncHandler.js`) wraps each async handler so rejections are forwarded to the central error handler instead of crashing the server.

---

## 4. How does MongoDB store and retrieve data?

Three collections are defined with Mongoose schemas:

- `User` — name, email (unique, lowercased), bcrypt-hashed password, `isAdmin`.
- `Product` — name, description, price, image URL, category, stock, rating.
- `Order` — userId, array of `items` (snapshot of productId/name/price/quantity), total, status, shippingAddress, paymentRef.

Mongoose lets us define a schema, then call methods like `MongoUser.findOne({ email })`, `MongoProduct.find(filter)`, or `MongoOrder.find({ userId }).sort(...)`.

**The trick in this repo:** if no `MONGODB_URI` is configured, the model methods instead use a tiny in-memory store (`config/memoryDB.js`) built on JS `Map`s. So you can demo the whole app with zero database setup, and switch to a real MongoDB by just setting the connection string. Search is done differently in each mode: MongoDB uses `$regex` on name/description (`models/Product.js` → `query()`), while memory mode filters with JavaScript `.includes()`.

---

## 5. How does authentication work?

`routes/auth.js`:

1. **Signup:** validate input → check no user with that email exists → `User.create()` hashes the password with **bcrypt** (10 salt rounds, `models/User.js`) → sign a JWT containing the user `_id` → return `{ token, user }`.
2. **Login:** look up by email → `bcrypt.compare(plain, hashed)` → on success sign a JWT → return `{ token, user }`. Errors are the same `"Invalid credentials"` whether the email or password is wrong, so we don't leak which one failed.
3. **Protected routes:** the `authRequired` middleware (`middleware/auth.js`) reads the `Bearer` token, `jwt.verify`s it with the secret from config, loads the user from the DB, and puts `req.user = { id, email, name, isAdmin }`.
4. **Ownership:** `GET /api/orders/:id` also checks `order.userId === req.user.id` (or admin), returning `403` otherwise.

The JWT secret comes from `config/env.js`, which intentionally **fails fast in production** if `JWT_SECRET` is missing, and warns in development if it's weak/placeholder.

---

## 6. How do the shopping cart and order flow work?

- **Cart** is client-side only (`context/CartContext.jsx`), persisted in `localStorage`. Items store `productId, name, price, image, quantity`. The provider exposes `addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`, `total`, `count`.
- **Checkout** (`pages/Checkout.jsx`) sends `{ items: [{productId, quantity}], shippingAddress, card }` to `POST /api/orders/checkout`.
- **Server** (`routes/orders.js`):
  1. Validates the payload (`utils/validators.js`).
  2. Simulates payment: card ending `0000` → `402 declined`; otherwise accepted.
  3. Looks up each product and **recomputes prices from the database** — a client can't set its own price because the payload only carries `productId` and `quantity`.
  4. Creates the `Order` with `status: "paid"` and a `mock_<uuid>` payment reference.
- On success the cart is cleared and the user is redirected to the new order page.
- **History:** `GET /api/orders` returns that user's orders (newest first); `GET /api/orders/:id` returns one order, owner-only.

---

## 7. What did I implement myself?

A clear-cut summary of the changes I made on top of the original project:

**Improvements (feature work)**
- Product **text search** (`?q=`) and **sorting** (price asc/desc, top rated, newest) — new `Product.query()` in `models/Product.js`, new query params in `routes/products.js`, new search box + sort dropdown in `pages/Home.jsx`.
- **Order-history polish:** consistent newest-first ordering in both DB modes, human-readable status labels, full order-detail view (date, line items, totals).

**Validation & quality**
- New server-side validators (`utils/validators.js`) for signup, login, and checkout (email format, password length, quantity 1–99, address fields, card number/expiry/CVC rules).
- Client-side inline form validation with accessible labels in Login, Signup, and Checkout; loading/empty/error states added to Home, ProductDetail, Orders, OrderDetail.
- Safe `localStorage` parsing in AuthContext and CartContext.

**Security hardening**
- `config/env.js` — fail-fast JWT secret in production, dev warnings.
- Central JSON error handler (`middleware/errorHandler.js`) — generic messages in production, no leaked internals.
- `helmet`, `express.json({ limit: "50kb" })`, `app.disable("x-powered-by")`, multi-origin CORS from `CLIENT_URL`.
- Fixed dependency vulnerabilities via upgrades + `overrides` (client: 0 audit issues).

**Testing**
- Refactored the app into a testable factory (`src/app.js`) and added a 38-test API suite (`server/test/*.test.js`, `node --test` + Supertest).

**Project / deployment readiness**
- `VITE_API_URL` support in the Axios client, `.env.example` files for server and client, `DEPLOYMENT.md`, `render.yaml`, LICENSE, this guide, and a rewritten README with verified results.

---

## 8. Files you should know before the interview

| File | Why |
|------|-----|
| `client/src/api/client.js` | The single point of contact between React and Express; JWT interceptor lives here. |
| `client/src/context/CartContext.jsx` | Whole cart feature — explain localStorage + derived totals. |
| `client/src/context/AuthContext.jsx` | How the app remembers login state. |
| `client/src/pages/Home.jsx` | Search + filter + sort UI (easy demo opener). |
| `server/src/app.js` | Middleware wiring — where the HTTP stack is configured. |
| `server/src/routes/orders.js` | Checkout logic, price recalculation, ownership checks. |
| `server/src/routes/auth.js` | Signup/login, JWT issuance, bcrypt. |
| `server/src/middleware/auth.js` | Token verification on protected routes. |
| `server/src/models/Product.js` | The search/sort `query()` and the memory-vs-Mongo branching. |
| `server/src/config/memoryDB.js` | The clever low-setup demo trick. |
| `server/src/utils/validators.js` | Server-side validation rules. |
| `server/test/orders.test.js` | Example of a good test file to talk about. |

---

## 9. Five likely interview questions and answers

**Q1. How do you keep the cart and the order consistent? The cart is in localStorage but orders are in MongoDB.**
A: The cart is a draft on the client. At checkout only `productId` and `quantity` are sent to the server. The server re-fetches each product and recalculates prices and totals from the database, so a user can't invent a cheaper price. The cart is then cleared and the order record is the source of truth for history.

**Q2. How would you add an admin panel or make a user an admin?**
The `isAdmin` flag already exists on the User schema. A protected admin route could check `req.user.isAdmin` in `authRequired`-style middleware. Also, the order detail factory checks `!req.user.isAdmin`. The seed script or a `PATCH /api/users/:id/role` endpoint could set the flag. I'd scope it with a dedicated `adminRequired` middleware.

**Q3. Why did you add an in-memory database? Isn't that two code paths to maintain?**
The original project uses it so the demo runs with zero setup. My change keeps the dual path but centralizes the branching inside model methods (`isUsingMemoryDB()`), so route handlers don't care which backend is active. It also makes the test suite run without a real MongoDB. The trade-off (two paths) is documented, and both paths are covered — the memory path by tests, the Mongo path by running with a real connection string.

**Q4. How do you prevent one user from seeing another user's orders?**
Two layers: `authRequired` makes sure the request is authenticated, and `GET /api/orders` only queries `{ userId: req.user.id }`. For the single-order endpoint, the handler compares `order.userId` to `req.user.id` and returns `403 Forbidden` unless admin. This is covered by a test (`forbids another user from viewing someone else's order`).

**Q5. How would you make this production-ready for real payments?**
Replace the mock in `routes/orders.js` with Stripe: create a PaymentIntent server-side, never trust client prices (we already don't), handle webhooks for payment confirmation, and move JWT from localStorage to httpOnly cookies to reduce XSS exposure. Also add rate limiting on `/api/auth/*`, and a real order-status pipeline (`pending → processing → shipped → delivered`, fields already scaffolded in `models/Order.js`).

---

## 10. Three limitations and what to improve next

1. **No real payment** — checkout is simulated by design. Next: Stripe test mode.
2. **No order status lifecycle** — orders are always `paid`; nothing advances them. Next: admin endpoint that moves status through `pending/processing/shipped/delivered`, or a queue. The enum/labels already exist.
3. **Token in `localStorage` + no rate limiting** — localStorage is readable by any XSS-injected script (common in demos), and `/auth` endpoints have no brute-force protection. Next: httpOnly-cookie sessions and an `express-rate-limit` on auth routes.
   Also: stock is displayed but never decremented on order placement.

---

## 11. Architecture diagram

```
Browser (React SPA)
┌────────────────────────────────────────────┐
│ Navbar | Home (search/filter/sort)        │
│ ProductDetail | Cart (localStorage)       │
│ Checkout (mock card) | Orders/OrderDetail │
│ Context API: AuthContext, CartContext     │
│ ApiClient (Axios) ── JWT header           │
└───────────────┬────────────────────────────┘
                │ HTTP + JSON (/api/*)
                │ dev: Vite proxy → :5000
                │ prod: VITE_API_URL
┌───────────────▼────────────────────────────┐
│ Express app (app.js)                      │
│ helmet | cors | express.json | morgan     │
│  /api/health                              │
│  /api/auth   → signup, login, JWT+bcrypt │
│  /api/products → q, category, sort       │
│  /api/orders → checkout, history         │
│ asyncHandler → central errorHandler       │
├───────────────────────────────────────────┤
│ Models (User/Product/Order)              │
│   isUsingMemoryDB() ? memoryDB : Mongoose│
└───────────────┬───────────────────────────┘
        ┌───────┴────────┐
        ▼                ▼
   MongoDB Atlas     In-memory Maps
   (Mongoose ODM)    (zero-setup demo)
```

---

## 12. Demonstration script (5–7 minutes)

Setup: `cd server && npm run dev`, then in another terminal `cd client && npm run dev`.

1. **Home / catalog** — show the grid, type "headphone" in search, clear it, click the **electronics** chip, change sort to *Price: high→low*. Say: *"The search, category filter, and sort all run against the API via query params — the page refetches from Express."*
2. **Product detail** — open a product, show stock and rating, set quantity 2, Add to Cart.
3. **Cart** — show the badge count, change quantity, show the total recalculates instantly (it's derived in CartContext).
4. **Signup** — create an account. Mention: *"The password is bcrypt-hashed before storage; the JWT is returned and stored in localStorage and attached on every request by an Axios interceptor."*
5. **Checkout** — fill in a made-up address and card `4242 4242 4242 4242`. Submit → order page. Then place another with a card ending `0000` and show the decline message. Say: *"The server validates every field and recalculates the total from database prices."*
6. **Orders** — open the Orders page, show multiple orders newest-first, open one for detail.
7. **Security beats** — mention protected routes (`/orders` redirects to login), ownership check, helmet/CORS, and that stack traces aren't sent to clients in production.
8. **Tests** — `cd server && npm test` → 38 passing tests. Mention the ones you're most comfortable explaining (e.g., server-side pricing and the 403 ownership test).
9. **Time permitting** — show `Product.query()` branching between MongoDB `$regex` and in-memory `.includes()`, and explain dual database mode.
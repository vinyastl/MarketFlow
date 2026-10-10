# Deployment Guide

This guide prepares **ShopMERN** for production using **Render** (backend + frontend) and **MongoDB Atlas** (database). The same environment variables work for Railway, Fly.io, Vercel, Netlify, etc.

> Everything here uses **your own accounts**. The repository contains **no deployed live URL** — after you follow these steps you will own the URLs.

## Overview

```
Browser ──▶ https://shopmern-client.onrender.com  (React static site, Vite build)
                     │  (fetch /api/*)
                     ▼
        https://shopmern-api.onrender.com         (Express API, Node)
                     │  (Mongoose)
                     ▼
        MongoDB Atlas cluster (cloud database)
```

## Option A — Render + MongoDB Atlas (recommended)

### 1. Database: MongoDB Atlas

1. Create a free account at https://www.mongodb.com/atlas
2. Create a **free cluster** (M0).
3. Under **Database Access**, create a database user and note the password.
4. Under **Network Access**, allow `0.0.0.0/0` (or your environment's IP) for now.
5. In the cluster, click **Connect → Drivers** and copy the connection string:
   `mongodb+srv://<user>:<password>@<cluster>.../shopmern`
6. Keep this string handy — **never add it to the repository**. It goes only into the hosting platform's environment variables.

### 2. Backend: Render web service

1. Push this repository to GitHub.
2. In Render dashboard: **New → Web Service**, connect the repo.
3. Settings:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | a long random string, e.g. generate at https://randomkeygen.com or `openssl rand -hex 32` |
   | `MONGODB_URI` | the Atlas connection string from step 1 |
   | `CLIENT_URL` | `https://shopmern-client.onrender.com` (your frontend URL) |

5. Deploy. Note the backend URL: `https://shopmern-api.onrender.com`.

### 3. Frontend: Render static site (or Vercel/Netlify)

1. In Render dashboard: **New → Static Site**, connect the repo.
2. Settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Environment Variables:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://shopmern-api.onrender.com` |

4. Deploy. Your site is at `https://shopmern-client.onrender.com`.

### 4. Seed the database with sample products

The app only auto-seeds in **in-memory mode**. On a real MongoDB you seed once:

```bash
cd server
# set MONGODB_URI in server/.env to your Atlas string first, or export it
npm run seed
```

Or run the one-off seed from Render's shell/console: `npm run seed`.

### 5. Verify

- Visit `https://shopmern-api.onrender.com/api/health` → `{ "status": "ok", "dbMode": "mongo" }`
- Open the frontend URL, create an account, and place a test order.

## Option B — Same project, one-click with `render.yaml`

The included [`render.yaml`](./render.yaml) is a Render Blueprint that creates both services. Open **New → Blueprint** in Render, select this repo, and fill in `JWT_SECRET` / `MONGODB_URI` when prompted.

## Alternative: Railway or Fly.io for the backend

- **Railway:** new project → deploy from repo, set **Root Directory** `server`, start command `npm start`, add the same env vars.
- **Vercel (frontend):** import repo, **Root Directory** `client`, build `npm install && npm run build`, output `dist`, env `VITE_API_URL=https://your-api.railway.app`.

## Environment variable reference

| Where | Key | Purpose |
|-------|-----|---------|
| Server | `PORT` | Host assigns this automatically on Render/Railway; Express reads it. |
| Server | `NODE_ENV=production` | Generic error messages (no stack/`err.message`), stricter JWT secret check. |
| Server | `JWT_SECRET` | Signs auth tokens. **Must be a strong random value.** |
| Server | `MONGODB_URI` | MongoDB connection string. |
| Server | `CLIENT_URL` | Comma-separated allowed CORS origins. |
| Client | `VITE_API_URL` | Backend base URL used by Axios. |

## Things to triple-check

- `JWT_SECRET` is **never** in the repo, screenshots, or pasted in chat. Set it directly in the host's dashboard.
- If you change the frontend URL, update the backend's `CLIENT_URL` too.
- MongoDB Atlas free clusters pause after ~7 days of inactivity; re-start it if the API returns DB connection errors.
- The checkout is **mock** — the card number is never sent anywhere but your own backend.
# Contextpack — Smart links, real-time telemetry

A no-signup URL shortener with custom aliases, optional expiration, QR downloads, and a live click analytics dashboard. The application is split into a React/Vite frontend and an Express/MongoDB API.

## Requirements

- Node.js 20 or later and npm
- A MongoDB database (local MongoDB or MongoDB Atlas)

## Run locally

1. Create local environment files from the examples:

   ```powershell
   Copy-Item server\.env.example server\.env
   Copy-Item client\.env.example client\.env
   ```

2. Set `MONGO_URI` in `server/.env` to a reachable MongoDB connection string. For local MongoDB, for example:

   ```dotenv
   MONGO_URI=mongodb://127.0.0.1:27017/shortlink-saas
   ```

3. Install and start the API:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

   The API listens on `http://localhost:5000` by default. `GET /health` returns a JSON health status.

4. In a separate terminal, install and start the frontend:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

   Open the Vite URL (normally `http://localhost:5173`). The example client API URL already points to the local API.

## Environment variables

### Backend (`server/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection URI. Use a URL-encoded database username/password. |
| `CLIENT_URL` | Yes in production | Allowed frontend origin(s), comma-separated when using multiple origins. Include scheme and host, without a trailing slash. |
| `BASE_URL` | Yes | Public API/short-link origin, without a trailing slash. For local development, use `http://localhost:5000`. |

### Frontend (`client/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Public API origin, without a trailing slash. Vite embeds this value at build time. |

Do not expose backend secrets in frontend variables. Never commit `.env` files.

## API

- `POST /api/urls/shorten` — create a short link. JSON body: `{ "originalUrl": "https://example.com", "customAlias": "optional-alias", "expiration": "24h|7d|30d" }`. Omit or send an empty expiration string for no expiry.
- `POST /api/urls/batch` — refresh locally saved links. JSON body: `{ "shortCodes": ["abc1234"] }`; accepts up to 100 codes.
- `GET /api/urls/analytics/:shortCode` — click totals, daily clicks, device, browser, and referrer breakdowns.
- `GET /health` — service health probe.
- `GET /:shortCode` — issue a 302 redirect and record click telemetry.

Creation is limited to 30 requests per IP per 15 minutes; batch refresh is limited to 60 requests per IP per 15 minutes. Custom aliases are normalized to lowercase URL-safe characters and reserved frontend/API paths are rejected. Only HTTP(S) destination URLs are accepted.

## Deploy MongoDB Atlas

1. Create an Atlas project and cluster, then create a database user with a strong password.
2. In **Network Access**, allow connections from the backend hosting provider. For a quick initial deployment, Atlas can allow `0.0.0.0/0`; restrict this to provider egress IP ranges where available.
3. Copy the cluster connection string and replace its database username, password, and database name. URL-encode special characters in credentials.
4. Keep the connection string private; add it as the backend's `MONGO_URI` environment variable rather than committing it.

## Deploy the backend to Render

1. Push this project to a GitHub repository and create a **Web Service** in Render connected to it.
2. Set the **Root Directory** to `server`, **Build Command** to `npm install`, and **Start Command** to `npm start`.
3. Use a Node.js runtime and add these environment variables in Render:

   ```dotenv
   MONGO_URI=<Atlas connection string>
   CLIENT_URL=https://<your-vercel-domain>
   BASE_URL=https://<your-render-service>.onrender.com
   NODE_ENV=production
   ```

   Render supplies `PORT`. For preview deployments or multiple frontend origins, set `CLIENT_URL` to a comma-separated list of exact origins.
4. Deploy and verify `https://<your-render-service>.onrender.com/health` returns `{"status":"ok"}`. Use that service origin as the frontend API URL.

Railway can host the same Node service: deploy the `server` directory and configure the same environment variables. Set `PORT` only if the platform does not provide it automatically.

## Deploy the frontend to Vercel

1. Import the GitHub repository as a Vercel project.
2. Set **Root Directory** to `client`, select the Vite framework preset, and use `npm run build` with `dist` as the output directory.
3. Add the build-time environment variable:

   ```dotenv
   VITE_API_URL=https://<your-render-service>.onrender.com
   ```

4. Deploy. `client/vercel.json` rewrites browser routes to `index.html`, so refreshing `/analytics/:shortCode` works on Vercel.
5. Once the final Vercel domain is assigned, set the backend's `CLIENT_URL` to that exact origin and redeploy/restart the API. If it changes, update the CORS allowlist.

## Production notes

- The link list is stored in each visitor's browser `localStorage`; links are not associated with an account and will not sync across browsers/devices.
- Click totals and breakdowns are based on recorded click events. The dashboard refreshes its analytics every 15 seconds while open.
- Browser privacy tools and ad blockers may limit clipboard, referrer, or user-agent data. Referrers are reduced to hostnames; IP addresses are not stored.
- MongoDB's TTL index removes expired URL documents asynchronously; the API also checks expiry before redirects and analytics responses.
- Use HTTPS for the public frontend and API in production. Configure Atlas network access for the backend and monitor service logs, database capacity, and rate-limit responses after launch.

## Tech stack

React, Vite, Tailwind CSS, React Router, Axios, Lucide, Recharts, React Hot Toast, `qrcode.react`, Node.js, Express, MongoDB/Mongoose, `nanoid`, `ua-parser-js`, `express-rate-limit`, and CORS.

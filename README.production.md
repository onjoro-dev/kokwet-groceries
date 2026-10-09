# KOKWET Groceries production hosting

This document is the production runbook for the project. The app is intentionally split into a
frontend storefront and a backend API so that each can be deployed and configured independently.

## 1. Frontend deployment

- Deploy the `frontend` directory to Cloudflare Pages.
- Set the Cloudflare Pages root directory to `frontend`.
- Build command: `npm run build`
- Output directory: `dist`
- Production environment variable: `VITE_API_URL=https://<backend-host>/api`
- The included `frontend/public/_redirects` file ensures client-side routes keep working.
- Add the exact storefront origin to the backend `CLIENT_URL` environment variable.

Example:

```env
VITE_API_URL=https://kokwet-groceries-api.onrender.com/api
```

## 2. Backend deployment

- Deploy the `backend` directory to Render, Railway, Fly.io, or a Node.js host.
- Use the included `backend/render.yaml` as the Render-ready config.
- For Docker, build with `docker build -t kokwet-groceries-api ./backend`; the included
  multi-stage `backend/Dockerfile` compiles the TypeScript API.
- Set environment variables as production secrets:
  - `NODE_ENV=production`
  - `PORT=10000`
  - `MONGO_URI=<Atlas SRV URI>`
  - `JWT_SECRET=<long random secret>`
  - `CLIENT_URL=https://<frontend-production-origin>`
  - `FREE_DELIVERY_THRESHOLD=3000`
  - `STANDARD_DELIVERY_FEE=150`
- The API health endpoint is `/api/health`.

Example backend config:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://<user>:<password>@kokwet-groceries.<cluster>.mongodb.net/kokwet-groceries?retryWrites=true&w=majority
JWT_SECRET=<generate-a-long-random-secret>
CLIENT_URL=https://kokwet-groceries.pages.dev
FREE_DELIVERY_THRESHOLD=3000
STANDARD_DELIVERY_FEE=150
```

## 3. MongoDB Atlas setup

- Create a MongoDB Atlas cluster and a database user.
- Scope the user to the `kokwet-groceries` database only using a custom role.
- Do not use a broad role like `readWriteAnyDatabase` unless the project genuinely requires it.
- Copy the Atlas SRV URI as `MONGO_URI`.
- Allow the backend host to connect to the cluster.

## 4. GitHub + Render + Cloudflare flow

1. Create the repository on GitHub.
2. Connect the repo to Render for the backend service.
3. Connect the repo to Cloudflare Pages for the frontend service.
4. Use the deployed backend URL in the frontend `VITE_API_URL`.
5. Use the deployed frontend URL in the backend `CLIENT_URL`.

This is the exact trust boundary that keeps sales, auth, and uploads working in production:
frontend origin -> backend API -> MongoDB Atlas.

## 5. Uploaded files

Product and admin uploads are served from the backend's `uploads/` directory. Configure a
persistent disk at that path on the API host or move uploads to durable object storage before
relying on uploaded images in production; container filesystems are often replaced during deploys.

## 6. Admin configuration check

- Set a real store phone number in Admin Settings to enable WhatsApp enquiries.
- The application does not use a placeholder contact number by default.
- If using social login, confirm the OAuth callback URLs match the deployed backend and
  storefront origins exactly.

# KOKWET Groceries production hosting

## Frontend

- Deploy the `frontend` directory to Cloudflare Pages. The included `frontend/wrangler.toml` sets the Pages output directory.
- Set the Cloudflare Pages root directory to `frontend`.
- Build command: `npm run build`
- Output directory: `dist`
- Production environment variable: `VITE_API_URL=https://<backend-host>/api`
- The included `frontend/public/_redirects` file supports client-side routes.
- Add the deployed storefront origin to the backend `CLIENT_URL` setting.

## Backend

- Deploy the `backend` directory to Render, Railway, Fly.io, or a Node.js container host.
- Use the included `backend/render.yaml` as a Render-ready configuration.
- For Docker, build with `docker build -t kokwet-groceries-api ./backend`; the included multi-stage `backend/Dockerfile` compiles the TypeScript API.
- Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` as environment secrets. `CLIENT_URL` must be the exact HTTPS storefront origin.
- Set a real store phone number in Admin Settings to enable WhatsApp enquiries; the application does not use a placeholder contact number.
- The API health endpoint is `/api/health`.

## MongoDB

- Create a MongoDB Atlas cluster and database user.
- Allow the backend host's public IP address to connect.
- Use the Atlas SRV connection URI as `MONGO_URI`.

## Uploaded files

Product and admin uploads are currently served from the backend's `uploads/` directory. Configure a persistent disk at that path on the API host or move uploads to durable object storage before relying on uploaded images in production; container filesystems are often replaced during deploys.

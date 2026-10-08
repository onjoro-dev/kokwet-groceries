# KOKWET Groceries

A full grocery e-commerce site (customer storefront + admin dashboard) built with
**TypeScript, React, Tailwind CSS, Express, and MongoDB** — modeled on Carrefour Kenya's
online store, styled in green, white, and a touch of orange.

```
kokwet-groceries/
├── backend/     Express + TypeScript + MongoDB API
└── frontend/    React + TypeScript + Tailwind storefront + admin dashboard
```

## What's inside

**Customer storefront**
- Home page with hero banner, category shortcuts, and featured products
- Category browsing with sorting, and a search page with live results
- Product detail pages with stock levels, discount badges, and related items
- Persistent cart (drawer + full page) that survives a page refresh
- Checkout with delivery-area selection, Cash on Delivery or M-Pesa, and a clear price
  breakdown (subtotal, delivery fee, total) before the order is placed
- Order confirmation and order tracking with a visual progress tracker
- Mobile-first design with a bottom navigation bar, and a desktop layout with a sticky header

**Admin dashboard** (`/admin`)
- Simple sidebar navigation with large icons and plain-language labels
- Dashboard with big, easy-to-read numbers (orders, revenue, pending deliveries)
- Product management: add, edit, delete, mark featured/hidden, track stock
- Category management: add, rename, delete
- Order management: see every order and move it forward (Confirm → Preparing →
  Out for delivery → Delivered) with one tap, or cancel it
- Confirmation prompts before any delete, so mistakes are hard to make by accident

## Getting started

You'll need [Node.js](https://nodejs.org) (v18+) and a MongoDB database — either
installed locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# open .env and set MONGO_URI (and JWT_SECRET to any long random string)
npm run seed     # creates sample categories, products, and an admin account
npm run dev      # starts the API on http://localhost:5000
```

Seed creates an admin login you can use immediately:
- **Email:** admin@kokwetgroceries.co.ke
- **Password:** admin1234

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL should already point to http://localhost:5000/api
npm run dev      # starts the storefront on http://localhost:5173
```

Visit `http://localhost:5173` for the storefront, and `http://localhost:5173/admin/login`
for the admin dashboard.

### Browser smoke checks

With MongoDB, the API, and the storefront running, run the Selenium checks from the
`frontend/` directory:

```bash
npm run test:selenium
```

The check uses headless Chrome, signs in with the seeded local admin account, verifies
dashboard and customer pages, uploads and removes a temporary product with a test image,
and deletes the temporary image file. Override `KOKWET_ADMIN_EMAIL` and
`KOKWET_ADMIN_PASSWORD` if your local admin credentials differ.

## Adding your logo

Drop your logo file into `frontend/public/` (e.g. `logo.png`), then open
`frontend/src/components/layout/Logo.tsx` and replace the emoji + text with:

```tsx
<img src="/logo.png" alt="KOKWET Groceries" className="h-8" />
```

## Notes on payments and delivery

- **Cash on Delivery** works out of the box.
- **M-Pesa** is wired up as a payment *option* end-to-end (order records, statuses), but
  the actual Safaricom Daraja STK Push call is left as a clearly-marked extension point —
  add your consumer key, secret, shortcode, and passkey to `backend/.env`, then implement
  the STK push request inside `backend/src/controllers/orderController.ts` where the
  order's `paymentMethod` is `"mpesa"`. Keeping this separate means you can go live with
  Cash on Delivery today and turn on M-Pesa once you have Daraja API credentials.
- Delivery areas and the free-delivery threshold are simple lists/numbers you can edit in
  `frontend/src/pages/CheckoutPage.tsx` (`AREAS`) and `backend/.env`
  (`FREE_DELIVERY_THRESHOLD`, `STANDARD_DELIVERY_FEE`).

## Project conventions

- **No Redux/complex state libraries** — cart and auth use React's built-in Context API,
  persisted to `localStorage`, kept intentionally simple to read and extend.
- **File organisation** — one file per component/page/route, grouped by feature
  (`components/product`, `components/cart`, `pages/admin`, etc.), all in TypeScript.
- **Routing** — every route is declared in one place: `frontend/src/App.tsx` for the
  storefront + admin, and `backend/src/app.ts` for the API.

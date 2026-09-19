# AutoSpare — Car & Bike Spare Parts Store

A full-stack e-commerce website for an auto spare parts shop (car + bike
parts), with a complete admin panel for managing stock, photos, pricing,
orders and site content.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** for styling
- **Prisma ORM 7** + **SQLite** (file-based DB — no separate database server needed)
- **Custom auth** — JWT session cookies (`jose`) + hashed passwords (`bcryptjs`), no third-party auth service
- **Zustand** for the client-side shopping cart
- Local image uploads (`/public/uploads`), no cloud storage dependency required to get started

## Features

**Storefront**
- Home page with hero banners, category tiles, featured products, new arrivals
- Product catalog with search, category/vehicle-type/brand filters, price range, sorting, pagination
- Product detail pages with image gallery, stock status, compatibility info, and customer reviews
- Cart, checkout (Cash on Delivery / Bank Transfer) with required contact
  and shipping details, order confirmation, SMS alerts to the customer and
  shop owner on every order (see "Order SMS notifications" below)
- Customer accounts: register/login, order history, order detail
- Contact form, About page, Shipping/Returns, Terms, Privacy pages
- WhatsApp chat button, SEO metadata, sitemap.xml, robots.txt

**Admin Panel** (`/admin`)
- Dashboard with revenue, order, low-stock and message stats
- Products: add/edit/delete, multiple photo uploads with reordering, price/MRP, stock, SKU, category, brand, vehicle type, compatibility notes, featured/active toggles
- Categories: nested (parent/subcategory) management with images
- Brands: add/manage with logos
- Orders: view, filter by status, update order & payment status
- Reviews: approve/reject/delete customer reviews
- Contact messages inbox
- Customers list
- Homepage banner management
- Store settings: name, logo, contact info, social links, shipping fee / free-shipping threshold

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Generate a real `AUTH_SECRET` and set your own `ADMIN_EMAIL` / `ADMIN_PASSWORD`
(used only once, by the seed script, to create the first admin account):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### 3. Create the database and load sample data

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

(Prisma 7 doesn't auto-generate the client after `migrate dev` like older
versions did — `generate` has to be run explicitly, or the `db seed` step
below will fail with `Cannot find module '.../generated/prisma/client'`.)

This creates `dev.db` (SQLite) with all tables, and seeds it with an admin
account, sample categories, brands, 18 demo products (with generated
placeholder photos) and homepage banners — so the site looks complete
immediately.

### 4. Run the dev server

```bash
npm run dev
```

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login (sign in with the
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`)

**Change the admin password after first login** — the seeded one is a
placeholder for local development only.

## Replacing the Demo Content

Everything seeded (products, categories, brands, banners, store contact
info) is meant to be replaced from the admin panel:

- **Products/Photos**: `/admin/products` → delete the sample products and
  add your real stock, or edit them in place and swap the photos. Most demo
  products use real reference photos from Wikimedia Commons
  (`public/demo-products/`, credits in that folder's `CREDITS.md`) rather
  than generated graphics, so the catalog looks realistic out of the box —
  they're still just stand-ins for your actual stock photos.
- **Categories/Brands**: `/admin/categories`, `/admin/brands`.
- **Store info**: `/admin/settings` — name, logo, phone, WhatsApp, address,
  social links, shipping fee.
- **Homepage banners**: `/admin/banners`.

The placeholder product photos are plain generated images (colored
rectangles with the product name) — replace them with real photos through
each product's edit page.

## Project Structure

```
prisma/schema.prisma          Database schema (all models)
prisma/seed.ts                Sample data seed script
src/app/(storefront)/...      Customer-facing pages
src/app/admin/...             Admin panel pages
src/components/storefront/    Customer-facing UI components
src/components/admin/         Admin UI components (forms, image manager)
src/components/ui/            Shared low-level UI primitives
src/lib/actions/              Server Actions (all data mutations)
src/lib/queries.ts            Read queries used by storefront pages
src/lib/auth.ts               Session/JWT/password helpers
src/lib/upload.ts             Local image upload handling
src/proxy.ts                  Route protection for /admin and /account
```

## Moving to Production

A few things are intentionally simple to start (SQLite, local file
uploads, Cash-on-Delivery only) so the site runs with zero external
services. Before a real launch, consider:

**Database — move from SQLite to PostgreSQL/MySQL**
SQLite is great for getting started and works fine for small catalogs,
but a production deployment on serverless hosting (e.g. Vercel) needs a
real database server, since the filesystem isn't persistent between
deploys. To switch:
1. Change `provider = "sqlite"` to `"postgresql"` (or `"mysql"`) in
   `prisma/schema.prisma`.
2. Add a driver adapter for that database (e.g. `@prisma/adapter-pg`) and
   update `src/lib/prisma.ts` and `prisma/seed.ts` accordingly — see the
   `prisma-database-setup` skill bundled in this repo (`.agents/skills/`)
   for exact steps.
3. Update `DATABASE_URL` in `.env` and re-run `npx prisma migrate dev`.

**Image uploads — move from local disk to cloud storage**
`/public/uploads` works for local dev and single-server hosting, but not
for serverless platforms with an ephemeral filesystem. `src/lib/upload.ts`
is the single place that writes files — swap its implementation for a
provider like Cloudinary, AWS S3, or UploadThing, and it flows through to
every form (products, categories, brands, banners, settings) unchanged.

**Payments — add a real online payment gateway**
Checkout currently supports Cash on Delivery / Pay at Store and Bank
Transfer, which needs no merchant account to launch with. When you're
ready to accept online payments (Razorpay, Stripe, etc.), add the
gateway's checkout step in `src/lib/actions/orders.ts` (`placeOrderAction`)
and `src/components/storefront/CheckoutForm.tsx` — the `ONLINE` payment
method already exists in the database schema as a placeholder.

**Order notifications on WhatsApp — activate with a real provider**
Every successful order calls `notifyOrderPlaced()`
(`src/lib/notifications.ts`), which sends the full order details — items,
totals, payment method and delivery address — to the customer's WhatsApp
and to the shop owner's WhatsApp (`ADMIN_NOTIFY_PHONE`, defaults to
`9894705498`).

Until you set `WHATSAPP_PROVIDER` in `.env`, messages are printed to the
server console instead of being sent, and checkout still works normally.
To actually deliver messages, pick one:
- **`"meta"`** — [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api):
  set `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN`.
- **`"twilio"`** — set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and
  `TWILIO_WHATSAPP_FROM`. Twilio's sandbox is the quickest way to test.
- **`"webhook"`** — set `WHATSAPP_WEBHOOK_URL` to your own endpoint that
  receives `{ "to": "91…", "message": "…" }` and forwards it to an Indian
  BSP such as AiSensy, Interakt, Gupshup or Wati.

> **Important:** WhatsApp only lets a business send free-form messages to
> someone who messaged it in the last 24 hours. For order confirmations
> going to new customers you need an **approved message template** — create
> one in your provider's dashboard and put its name in
> `WHATSAPP_TEMPLATE_NAME`. This is a WhatsApp platform rule, not a limit
> of this app.

Regardless of setup, the admin order page always has working
**"WhatsApp customer"**, **"Call"** and **"Send copy to my WhatsApp"**
buttons — those use click-to-chat links and need no account at all.

SMS can be enabled alongside WhatsApp with `SMS_PROVIDER`
(`"twilio"` or `"webhook"`); see `.env.example`.

**Email notifications**
Order confirmations currently only show on-screen and in Order History —
no email is sent (no SMTP configured). Add a transactional email provider
(Resend, SendGrid, etc.) and call it from `placeOrderAction` once you have
credentials.

## Notes

- The Terms, Privacy, and Shipping & Returns pages contain generic
  starter text — have them reviewed before publishing.
- `npm run lint` and `npm run build` should both pass cleanly; run them
  after making changes.

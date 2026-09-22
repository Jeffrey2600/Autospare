# AutoSpare Parts — How to Run the Website

This guide gets the website running on your own computer so you can try
everything before it goes live on the internet.

You do **not** need any programming knowledge. It takes about 10 minutes,
most of which is waiting.

---

## Step 1 — Install Node.js (one time only)

The website needs a free program called Node.js to run.

1. Go to **https://nodejs.org**
2. Download the button that says **LTS** (the recommended version)
3. Run the installer and click Next until it finishes
4. **Restart your computer** after installing

> Already have Node.js? Make sure it's version 22.12 or newer. The setup
> will tell you if it's too old.

---

## Step 2 — Download the website files

1. Open the GitHub link you were sent
2. Click the green **Code** button → **Download ZIP**
3. Right-click the downloaded ZIP → **Extract All**
4. Remember where you extracted it (e.g. `Documents\Autospare`)

---

## Step 3 — Start the website

### On Windows

Open the extracted folder and **double-click `START.bat`**

That's it. A black window will open and do everything automatically:

- The first time, it installs what it needs — **this takes 3–5 minutes.**
  The window may look frozen; it isn't. Please wait.
- After that it starts the website and opens your browser automatically.

### On Mac

Open Terminal, type `cd ` (with a space), drag the folder onto the window,
press Enter, then run:

```bash
./start.sh
```

---

## Step 4 — Use the website

Once it says it's ready, open your browser to:

| What | Address |
|---|---|
| **The shop** (what customers see) | http://localhost:3000 |
| **Admin panel** (manage products & orders) | http://localhost:3000/admin/login |

**Admin login:**
- Email: `admin@example.com`
- Password: `ChangeMe123!`

> ⚠️ **Keep the black window open** while using the website.
> Closing it stops the website. To use it again later, just double-click
> `START.bat` again — it will start much faster the second time.

---

## What you can try

**In the admin panel:**
- **Add New Product** — upload photos, set price, stock and description
- **Products** → **Edit** — change anything about an existing product
- **Orders** — see orders, update their status, message customers on WhatsApp
- **Banners** — change the big images on the homepage
- **Settings** — shop name, phone number, address, delivery charges

**In the shop:**
- Browse and search parts, filter by car/bike, add to cart
- Place a test order and see it appear instantly in the admin panel

The site comes loaded with 18 demo products so you can see how it looks.
You can delete them and add your own real stock at any time.

---

## Common questions

**Is this live on the internet yet?**
No. Right now it only runs on your computer, for you to review. Once you're
happy with everything, it gets published to a real web address that your
customers can visit.

**Will my customers see this?**
Not yet — `localhost` means "this computer only". Nothing you do here is
public.

**Can I add my real products now?**
Yes, but note that anything you add now stays on your computer. When the
site goes live you may need to add them again, so it may be easier to wait.

**Will orders send WhatsApp messages?**
The feature is built and ready, but it needs a WhatsApp Business account
connected before real messages can be sent. Until then, orders still appear
in the admin panel, and each order has **WhatsApp** and **Call** buttons to
contact the customer with one tap.

**Something went wrong / I see a red error**
Take a screenshot of the black window and send it to your developer.

**How do I start fresh?**
Delete the file called `dev.db` in the folder, then double-click
`START.bat` again. This wipes all products and orders back to the demo set.

---

## For developers

See `README.md` for the technical setup, architecture notes, and the
production deployment checklist (Postgres migration, cloud image storage,
WhatsApp gateway configuration).

Quick reference:

```bash
npm install     # install dependencies
npm run setup   # create .env, migrate, generate, seed — in the right order
npm run dev     # start the development server
npm run db:reset # wipe and reseed the database
```

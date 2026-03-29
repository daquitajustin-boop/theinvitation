# 🌸 Saiah Alisbo — Baptism RSVP

Uses **Node.js + Nodemailer** to send emails via your Gmail.
No third-party email service needed.

---

## ⚙️ Step 1 — Fill in .env.local

Open `.env.local` and replace the values:

```env
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx

ADMIN_PASSWORD=saiah2025

EVENT_BABY_NAME=Saiah Alisbo
EVENT_DAY=Sunday
EVENT_DATE=April 21
EVENT_TIME=11:00 AM
EVENT_LOCATION=Bagong Parañaque Phase III, Open Court
EVENT_DRESS_CODE=Nude Browns & Pastels
```

### How to get your Gmail App Password:
1. Go to **myaccount.google.com → Security**
2. Turn on **2-Step Verification** (required)
3. Search **"App passwords"** in the search bar
4. Create one → name it "RSVP Site"
5. Google gives you **16 characters** (e.g. `abcd efgh ijkl mnop`)
6. Paste that as `GMAIL_PASS` ✓

> `.env.local` is in `.gitignore` — it will NOT be pushed to GitHub. Safe!

---

## ☁️ Step 2 — Add env vars to Vercel

Since `.env.local` stays on your computer and is NOT pushed to GitHub,
you need to add the same variables in Vercel too:

1. Go to **vercel.com** → your project
2. Click **Settings → Environment Variables**
3. Add each variable one by one:

| Name | Value |
|------|-------|
| `GMAIL_USER` | your_gmail@gmail.com |
| `GMAIL_PASS` | your 16-char app password |
| `ADMIN_PASSWORD` | saiah2025 |
| `EVENT_BABY_NAME` | Saiah Alisbo |
| `EVENT_DAY` | Sunday |
| `EVENT_DATE` | April 21 |
| `EVENT_TIME` | 11:00 AM |
| `EVENT_LOCATION` | Bagong Parañaque Phase III, Open Court |
| `EVENT_DRESS_CODE` | Nude Browns & Pastels |

4. Click **Save** → **Redeploy** your project ✓

---

## 🚀 Step 3 — Deploy

```bash
npm install
git init
git add .
git commit -m "init"
# push to GitHub → import on vercel.com → Deploy
```

---

## 🔐 Admin Dashboard

URL: `https://your-site.vercel.app/admin`
Password: set via `ADMIN_PASSWORD` in env vars

---

## 📱 QR Code

1. Deploy → copy your Vercel URL
2. Go to **qr.io** → paste URL → download QR image
3. Print or share!

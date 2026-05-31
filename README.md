# Samary Care — Time & Attendance

A location-verified shift-logging web app for care staff, with a live admin dashboard and payroll CSV export. Static frontend (GitHub Pages) backed by Firebase (Auth + Firestore).

## What it does

- **Staff** sign in (`index.html`) with their name + a personal PIN, pick the client they're attending, and check in. Check-in is **hard-blocked** unless their phone's GPS is within the configured radius (default 250m) of the client's address.
- **Hourly** shifts record date + arrival; the staff member checks out at the end. Checkout **auto-stamps the exact time** and is **GPS hard-blocked** (must still be on site). Hours are calculated automatically, including overnight shifts past midnight.
- **Live-in** placements record a start and end date and are counted in **days** — no hours calculated.
- **Admins** sign in on a **separate page** (`admin.html`) with email/password. Staff never see the admin login. The dashboard updates live: who's checked in now, monthly hours per staff, live-in days, full records, and one-click **payroll CSV** with per-staff totals. Admins manage staff/PINs, client locations, and the radius, can **edit any shift or close a forgotten one**, and see a **flag for shifts left open over 18 hours**.

## Files
- `index.html` — staff check-in page (give this URL to carers).
- `admin.html` — admin dashboard (your private URL; staff don't see it).
- `app-core.js` — **your Firebase config lives here, once**, plus shared helpers. Both pages import it.
- `styles.css` — shared styling.
- `firestore.rules` — paste into the Firestore Rules tab.
- `README.md` — this guide.

---

## Setup (about 20–30 minutes, one-off)

### Step 1 — Firebase project
Create a project at <https://console.firebase.google.com> (free Spark plan). Add a **Web app** (`</>`), copy the `firebaseConfig`.

### Step 2 — Config
Open `app-core.js` and paste your config into the `firebaseConfig` object near the top. (This is the **only** place config lives now.)

### Step 3 — Authentication
**Build → Authentication → Sign-in method**, enable **Anonymous** (staff tokens) and **Email/Password** (admins).

### Step 4 — Firestore + rules
1. **Build → Firestore Database → Create database** → production mode → region `europe-west2`.
2. **Rules** tab → paste the contents of `firestore.rules` → **Publish** (the publish step is essential).

### Step 5 — Admin account
1. **Authentication → Users → Add user** — your admin email + password.
2. Copy that user's **UID**.
3. **Firestore** → create a collection named exactly `admins` → add a document whose **ID is that UID** (any field, e.g. `email`).

### Step 6 — Deploy to GitHub Pages
Push all files to a repo, then **Settings → Pages →** deploy from `main`, root. Live at:
- Staff: `https://<username>.github.io/<repo>/`
- Admin: `https://<username>.github.io/<repo>/admin.html`

### Step 7 — Authorise domain
**Authentication → Settings → Authorized domains** → add `<username>.github.io`.

### Step 8 — First run
Open `admin.html`, sign in, **Seed the 8 rota locations**, then **correct each pin** in Google Maps (the seeds are approximate). Add staff with PINs in **Staff & PINs**, and share each PIN.

---

## Notes & limitations
- **HTTPS required** for geolocation + Firebase. GitHub Pages provides it; won't work from `file://`.
- **PINs are convenience-grade** (SHA-256 hashed, salted with the name). The real security boundary is Firebase Auth + the Firestore rules. For long-term payroll use, consider 6-digit PINs or full per-user auth.
- **Departure time** comes from the staff member's phone clock; the GPS block prevents location fraud, not clock changes — admin edit is the backstop.
- **Hours run from the typed arrival time to checkout**, i.e. when care began (the usual payroll basis), not from the check-in tap.
- The `firebaseConfig` is not a secret — Firebase web config is meant to be public; your data is protected by the rules.

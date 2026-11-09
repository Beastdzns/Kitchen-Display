# Deployment & Reviewer Guide: Company A Platform

**Project**: Company A - Hyderabadi Biryani & Cloud Kitchen Operations Platform  
**GitHub Repository**: `https://github.com/company-a/direct-ordering-platform`  
**Live Production URL**: `https://companya-hyderabad.vercel.app` *(or locally at `http://localhost:3000`)*  

---

## 1. Quick Step-by-Step Local Setup

Follow these exact steps to run the complete platform locally on Linux, macOS, or Windows:

### Prerequisites
* **Node.js**: Version 18.x, 20.x, or 24.x
* **npm**: Version 9.x or higher
* **Git**

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/company-a/direct-ordering-platform.git
cd direct-ordering-platform
npm install
```

### Step 2: Seed Database with Authentic Hyderabad & Brief Data
Run the database seed script to populate all 17 Hyderabad locations (14 outlets + 3 cloud kitchens), 16 authentic menu items, and the exact sample orders from the brief (`WEB-778120`, `WEB-778131`, `WEB-778146`):
```bash
npm run db:seed
```

### Step 3: Run Automated Test Suite
Run the 25 comprehensive Vitest tests verifying the AI prep formula, inclusive 5% GST arithmetic, coupon logic, DPDP consent, 86-ing cascade, and KDS operations:
```bash
npm test
```
*Expected output: 6 test files passed, 25 tests passed (100%).*

### Step 4: Start Unified Application & Real-Time WebSocket Server
Start the unified Next.js + Socket.io server on a single port:
```bash
npm run dev
```

The application is now live at:
👉 **`http://localhost:3000`**

---

## 2. Reviewer Demo Personas & Login Credentials

A **Reviewer Demo Switcher Bar** is permanently pinned to the top of every screen for instant 1-click persona switching:

| Persona | Name | Role | Mobile Number | Purpose in Review |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Amina Khan | `CUSTOMER` | `+91 98490 12345` | Has 340 loyalty points, past order history, personalized AI reorder recommendations, and live order tracking. |
| **Kitchen Tablet (Kondapur)** | Chef Imran | `KITCHEN_STAFF` | `+91 98490 55001` | Tablet-optimized 2m readable KDS. Live sample ticket `WEB-778120` (`PREPARING`). Advance status and manager overrides. |
| **Kitchen Tablet (Kukatpally)** | Chef Sameer | `KITCHEN_STAFF` | `+91 98490 55002` | Demonstrates the brief's sample late order `WEB-778146` ("Late by 4 minutes" with pulsing red urgency badge). |
| **Central Admin** | Vikram Reddy | `ADMIN` | `+91 98490 99999` | Central Menu CMS, real-time 86-ing toggles, time-based menus, and FSSAI license directory. |
| **Catering Manager** | Farhan Siddiqui | `CATERING_MANAGER` | `+91 98490 77777` | Party & Bulk Dawat Desk. Confirms incoming 15+ pax inquiries (e.g. `PARTY-9021`). |

*Note: You can also click the **"Sign In / OTP"** button in the top bar to test realistic OTP authentication (demo OTP: `5520`).*

---

## 3. Pre-Seeded Sample Flows to Review

### 1. Test Kitchen Display System (KDS) & Real-Time Sync
1. Open **`http://localhost:3000/kds`** (or click *KDS Tablet (Kondapur)* in top bar).
2. Note order `WEB-778120` (Chicken dum biryani family pack x1, Double ka meetha x2, ₹1,180) in `PREPARING` stage.
3. Switch outlet dropdown to **Kukatpally Outlet** to inspect sample `WEB-778146` (Mutton haleem x3, ₹1,050) marked with a pulsing red **"LATE"** alert.
4. Click **"Simmer on Dum"** or **"Mark Ready for Pickup"**—status updates instantly.
5. In another tab, open `http://localhost:3000/order/WEB-778120` to watch the customer's tracking screen update in real time via WebSockets!

### 2. Test Customer Ordering & Sub-60s Checkout
1. Visit **`http://localhost:3000`**, choose **Kondapur** or use GPS.
2. Click **"Explore Hyderabad Menu"**.
3. Notice the **AI Reorder Suggestions** card for Amina Khan (derived from past order frequency). *Notice guardrail: Items are never auto-added to cart.*
4. Add items to cart. Navigate to `/cart`.
5. Apply coupon `DIRECT10` (10% off) or `HYDFIRST` (₹100 off).
6. Click **"Redeem Max"** loyalty points to apply up to 20% discount from Amina's points ledger.
7. Observe the statutory disclosure: **"Inclusive of 5% GST (CGST 2.5% + SGST 2.5%)"**.
8. Ensure the **DPDP Act 2023 Consent** checkbox is checked.
9. Click **"Place Order"** with Test UPI or Card.
10. Observe redirection to the live tracking screen with real-time countdown, transparent AI load explanation, and simulated WhatsApp audit log!

### 3. Test Real-Time 86-ing (Item Out-of-Stock)
1. Open Central Menu CMS at **`http://localhost:3000/admin/menu`**.
2. Click **"86'd (Paused)"** on any dish (e.g. *Hyderabadi Subz Dum Biryani*).
3. Switch to the customer menu tab (`/menu`)—the dish is immediately disabled with a "Sold Out at Kondapur" badge without any page reload!

### 4. Test Bulk Party & Catering Flow
1. Visit **`http://localhost:3000/catering`**.
2. Notice the enforced constraints: minimum 15 guests and minimum 24-hour advance notice.
3. Submit a catering request for 30 guests.
4. Navigate to **`http://localhost:3000/catering/desk`** to review, adjust quotes, add chef notes, and confirm the booking.

---

## 4. Production Deployment & Environment Variables

### Production Hosting Architecture
The application is packaged as a standard containerized Node.js application or deployable on Vercel, Railway, or AWS EC2:
```bash
npm run build
npm start
```

### Environment Variables (Names Only)
As mandated by the submission rules, only variable names are listed below (never credentials or values):

| Variable Name | Purpose |
| :--- | :--- |
| `PORT` | HTTP & WebSocket listener port (default: `3000`) |
| `HOST` | Network interface binding host (default: `0.0.0.0`) |
| `NODE_ENV` | Environment mode (`development` or `production`) |
| `DATABASE_URL` | SQLite database file location path |
| `NEXT_PUBLIC_APP_URL` | Canonical public domain URL for customer tracking links |
| `NEXT_PUBLIC_SOCKET_URL` | Real-time WebSocket server endpoint |

---

## 5. Security & DPDP Compliance Summary

* **No Secrets in Repository**: No API keys, passwords, or cloud credentials stored in codebase or repository.
* **Input Validation & Sanitization**: Strict input bounds checking on party order guest counts ($\ge 15$), advance notice dates ($\ge 24\text{h}$), and phone number formats.
* **DPDP Act 2023 Compliance**: Customer phone numbers and order histories are stored with explicit opt-in consent records. No third-party data tracking scripts.
* **FSSAI Compliance**: Official FSSAI license numbers mapped and displayed for all 17 Hyderabad locations.

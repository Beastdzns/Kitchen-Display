# Deployment and Reviewer Guide

**GitHub repository:** https://github.com/Beastdzns/Kitchen-Display
**Live application:** Not deployed.

> The submission archive contains only the requested TDD PDF and this guide. These steps assume you have the project source separately and run commands from its root directory.

## Run locally

### Prerequisites

- Node.js 18.18 or newer (Node.js 20 LTS recommended)
- npm

### Steps

1. Open a terminal in the project source directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. If you need a fresh demo database, seed it:

   ```bash
   npm run db:seed
   ```

   **Warning:** Seeding resets the existing local demo records. Do not run this against a database containing data you need to keep.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). The Next.js app and Socket.IO server run together. Stop the server with `Ctrl+C`.

To run the tests, use `npm test`. To build and start the production-mode Node server, run:

```bash
npm run build
npm start
```

The SQLite database is `sqlite.db` in the project root. Keep that file writable and persistent for the lifetime of the app.

## Deployment notes

No hosted deployment is configured for this submission. A production host would need to support the custom Node.js server, WebSocket connections, and persistent writable storage for SQLite. A serverless deployment without those properties is not suitable without changing the architecture.

## Environment variables

Only these server variables are read by the application; defaults are used if they are omitted:

| Name | Purpose |
|---|---|
| `PORT` | HTTP and WebSocket listener port; defaults to `3000`. |
| `HOST` | Network interface to bind; defaults to `0.0.0.0`. |
| `NODE_ENV` | Selects development or production mode. |

No production payment, database, or messaging credentials are required by the demo. Do not add secret values to the repository.

## Reviewer demo access

There is no production authentication or password. Use the role switcher at the top of the app; the buttons open the corresponding demo surfaces:

- **Customer:** select Customer, then use the home page and menu.
- **Kitchen:** select KDS Tablet (Kondapur), or choose another outlet in the KDS screen.
- **Central admin:** select Central Admin to open menu administration.
- **Catering manager:** select Catering Desk.

The sign-in/OTP panel is simulated; no real phone number or password is needed. Demo personas, order records, and contact values are placeholders. Review sample orders `WEB-778120`, `WEB-778131`, and `WEB-778146`, and sample catering request `PARTY-9021`.

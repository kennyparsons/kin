# Agent Instructions for Kin CRM

This document serves as a guide for AI agents assisting with the development of **Kin CRM**. It outlines the project structure, tech stack, established patterns, and operational procedures to ensure consistency and quality.

## 1. Project Overview
**Kin** is a personal relationship management (CRM) tool.
- **Goal:** Help users manage personal interactions, reminders, and contacts securely.
- **Architecture:** Monorepo with a distinct Frontend (`web`) and Backend (`api`).
- **Deployment:** Cloudflare Pages (Web) + Cloudflare Workers (API) + Cloudflare D1 (Database).

## 2. Tech Stack & Conventions

### Backend (`api/`)
- **Runtime:** Cloudflare Workers.
- **Framework:** Hono (Lightweight, web-standards based).
- **Database:** D1 (SQLite). Access via `c.env.DB.prepare()`.
- **Authentication:**
  - **Strategy:** JWT stored in an HTTP-Only, Secure, SameSite=None cookie (`kin_session`).
  - **Passwords:** Hashed with `bcryptjs`.
  - **User Management:** No public signup. Users are inserted manually via CLI.
- **Migrations:** Managed via `wrangler d1 migrations apply`. **DO NOT** run raw SQL files that drop tables.
- **Port:** `8787`.

### Frontend (`web/`)
- **Framework:** React + Vite.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS + Lucide React (Icons).
- **State Management:** React Context (`AuthContext`).
- **HTTP Client:** Native `fetch`.
  - **Critical Rule:** Always include `{ credentials: 'include' }` in fetch calls to ensure cookies are sent.
  - **Base URL:** Configured via `API_BASE` (Vite Proxy in dev, Environment Variable in prod).
- **Port:** `5173`.

## 3. Operational Workflows

### A. Database Changes
1.  **Never** edit `api/schema.sql` (it has been deleted).
2.  Create a new migration file: `api/migrations/XXXX_description.sql`.
    - Format: `0002_add_phone_column.sql`.
3.  Write strictly additive SQL (e.g., `ALTER TABLE`, `CREATE TABLE`).
4.  Apply locally: `cd api && npx wrangler d1 migrations apply kin-db-prod --local`.
5.  Apply remote (on deploy): `cd api && npx wrangler d1 migrations apply kin-db-prod --remote`.

### B. Local Development
1.  **Secrets:** Ensure `api/.dev.vars` exists with `JWT_SECRET`.
2.  **Start Backend:** `cd api && npm run dev`
3.  **Start Frontend:** `cd web && npm run dev`
4.  **CORS/Proxy:**
    - The frontend `vite.config.ts` proxies `/api` and `/auth` to `localhost:8787`.
    - The backend sets `SameSite=Lax` and `Secure=false` when detecting `localhost`.

### C. Authentication Debugging
- If login fails locally, check `api/.dev.vars` and `web/vite.config.ts` proxy settings.
- If login fails in production, check `wrangler secret put JWT_SECRET` and ensure `SameSite=None; Secure` cookies are enabled (Backend handles this automatically).
- **User Creation:** Use the `bcryptjs` node script in `README.md` to generate hashes and insert users manually.

### D. Deployment
1.  **API:** `cd api && npx wrangler deploy`
2.  **Web:** `cd web && npm run build && npx wrangler pages deploy dist --project-name kin-web`

## 4. Coding Standards
- **Types:** Shared types should be defined in `web/src/types.ts` (Frontend) and effectively mirrored or inferred in Backend.
- **Error Handling:** API should return JSON errors `{ error: "message" }` with appropriate status codes (401, 400, 500).
- **Security:**
  - Never expose `JWT_SECRET` in code.
  - Validate all inputs.
  - Ensure all private routes are protected by the auth middleware.

## 5. Known Quirks
- **Cookies:** Cross-origin cookies (Pages -> Workers) require `SameSite=None; Secure`. The API dynamically adjusts this based on the environment.
- **Date Handling:** Dates are stored as **Unix Timestamps (seconds)** in SQLite (`INTEGER`). Frontend converts them to JS Date objects (milliseconds).

---
**When in doubt, refer to the `README.md` or existing code patterns in `api/src/index.ts` and `web/src/components/`.**

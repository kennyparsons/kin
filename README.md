# Kin CRM

A personal CRM tool built with Cloudflare Workers (Hono), D1, and React (Vite).

## Project Structure

- `api/`: Backend (Cloudflare Worker + D1)
- `web/`: Frontend (React + Vite)

## Getting Started

### 1. Backend Setup

```bash
cd api
npm install
```

To develop locally with a local D1 database:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd web
npm install
npm run dev
```

### 3. Database Migration

Initialize the local database schema:

```bash
cd api
npx wrangler d1 execute kin-db --local --file=./schema.sql
```

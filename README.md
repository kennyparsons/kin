# Kin CRM

A personal relationship manager built on the Cloudflare Stack.

## Tech Stack

- **Backend:** Cloudflare Workers (Hono)
- **Database:** Cloudflare D1 (Serverless SQLite)
- **Frontend:** React (Vite + Tailwind CSS)
- **Deployment:** Cloudflare Pages (Frontend) & Workers (Backend)
- **Authentication:** HttpOnly Cookies (JWT)

## Project Structure

- `api/`: Backend Worker code & SQL schema.
- `web/`: Frontend React application.

---

## 🛠️ Local Development

### 1. Setup Backend (`api`)

1.  Navigate to the api folder:
    ```bash
    cd api
    npm install
    ```

2.  **Configure Secrets:**
    Create a file named `.dev.vars` in the `api/` directory. This is used by `wrangler` to inject secrets locally.
    ```toml
    # api/.dev.vars
    JWT_SECRET="your-local-secret-key-123"
    ```

3.  **Initialize Database:**
    Create the local D1 database tables.
    ```bash
    npx wrangler d1 execute kin-db-prod --local --file=./schema.sql
    ```

4.  **Create an Admin User:**
    Since there is no public signup page, you must insert a user directly into the database. Run this one-liner to create a user (email: `admin@example.com`, password: `password123`):
    ```bash
    # Generate hash for 'password123' and insert
    npx wrangler d1 execute kin-db-prod --local --command "INSERT INTO users (email, password_hash) VALUES ('admin@example.com', '\$2a\$10\$8K1p/a0dL1.7a.k1.7a.k.7a.k1.7a.k1.7a.k1.7a.k1.7a.k');"
    ```
    *(Note: To generate your own password hash, run `node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD', 10))"` inside the `api` folder).*

5.  **Start Backend:**
    ```bash
    npm run dev
    ```
    The API will run on `http://localhost:8787`.

### 2. Setup Frontend (`web`)

1.  Navigate to the web folder:
    ```bash
    cd web
    npm install
    ```

2.  **Start Frontend:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.
    
    *Note: The frontend is configured to proxy requests to `http://localhost:8787` when running locally.*

---

## 🚀 Production Deployment

### 1. Provision Resources

1.  **Create the D1 Database:**
    ```bash
    cd api
    npx wrangler d1 create kin-db-prod
    ```
    *Update `api/wrangler.toml` with the `database_id` returned by this command.*

2.  **Initialize Schema:**
    ```bash
    npx wrangler d1 execute kin-db-prod --remote --file=./schema.sql
    ```

3.  **Set Production Secrets:**
    You must set the `JWT_SECRET` in Cloudflare for production auth to work.
    ```bash
    cd api
    npx wrangler secret put JWT_SECRET
    # Enter a long, random string when prompted
    ```

### 2. Deploy API

1.  Ensure `api/wrangler.toml` has the correct `FRONTEND_URL` for CORS (e.g., `https://kin-web.pages.dev`).
2.  Deploy:
    ```bash
    cd api
    npx wrangler deploy
    ```
    Take note of your worker URL (e.g., `https://kin-api.your-name.workers.dev`).

### 3. Deploy Frontend

1.  **Configure Environment:**
    Update `web/.env.production` with your **Production API URL**:
    ```
    VITE_API_URL=https://kin-api.your-name.workers.dev
    ```

2.  **Build & Deploy:**
    ```bash
    cd web
    npm run build
    npx wrangler pages deploy dist --project-name kin-web
    ```

### 4. Create Production User

To log in, you need to manually insert your user into the remote database.

1.  **Generate a Password Hash:**
    ```bash
    cd api
    node -e "console.log(require('bcryptjs').hashSync('MY_SECURE_PASSWORD', 10))"
    ```
    *Copy the output (starts with `$2a$...` or `$2b$...`).*

2.  **Insert User:**
    ```bash
    npx wrangler d1 execute kin-db-prod --remote --command "INSERT INTO users (email, password_hash) VALUES ('myemail@example.com', 'PASTE_HASH_HERE');"
    ```

3.  Log in at your Cloudflare Pages URL!
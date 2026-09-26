# Trekigo

The public booking site, admin panel, and API now live in this repo.

## Folders

- `website/` — Next.js guest site
- `admin/` — Vite admin panel (same screens as Nirwana Stays)
- `backend/` — Express + MySQL API the admin uses

## Run locally

Without Docker, the API uses a local SQLite file (`USE_SQLITE=1` in `backend/.env`). macOS Control Center already uses port 5000, so the API defaults to **5001**.

1. Install and start the API:

```bash
cd backend && npm install && node server.js
```

2. Install and start the admin (http://localhost:5173). It reads `VITE_API_URL` from `admin/.env`:

```bash
cd admin && npm install && npm run dev
```

3. Start the website (http://localhost:3000):

```bash
cd website && npm run dev
```

If you have Docker and want MySQL instead:

```bash
docker compose up -d
# then set USE_SQLITE=0 in backend/.env
```

Admin login:

- Email: `admin@trekigo.com`
- Password: `admin@1234`

# Setup Guide

This guide walks through running the Programmatic SEO SaaS locally without Docker.

## Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 12+ (or Supabase database)
- Redis 7+

## 1) Supabase Project
1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.
3. Create a public storage bucket named `generated-pages` and confirm public read access.

## 2) Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` with:
- `DATABASE_URL` (Supabase connection string)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_STORAGE_BUCKET`

Run the API:
```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`.

## 3) Worker (RQ)
```bash
cd worker
python -m venv venv
venv\Scripts\activate
pip install -r ../backend/requirements.txt
copy .env.example .env
```

Ensure `worker/.env` matches `backend/.env`. Then:
```bash
python worker.py
```

## 4) Redis
Redis must be running for bulk jobs.

Windows (example with Redis service):
```bash
redis-server
```

Mac/Linux:
```bash
redis-server
```

## 5) Frontend (Next.js)
```bash
cd frontend
npm install
copy .env.local.example .env.local
```

Edit `frontend/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (usually `http://localhost:8000`)

Run:
```bash
npm run dev
```

Visit `http://localhost:3000`.

## Troubleshooting
- If bulk jobs stay queued, verify Redis is running and the worker is started.
- If file downloads fail, confirm the Supabase bucket is public and named `generated-pages`.
- If auth fails, re-check `SUPABASE_JWT_SECRET` and the Supabase keys in your `.env` files.

# Setup Guide

This guide walks through running the Programmatic SEO SaaS locally without Docker.

## Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 12+ (or Supabase database)
- Redis 7+

## 1) Supabase Project
Create a Supabase project and run the SQL in `supabase/schema.sql` in the SQL editor.

Create a public storage bucket named `generated-pages` and confirm public read access.

## 2) Backend
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

Run:
```bash
uvicorn app.main:app --reload --port 8000
```

## 3) Worker
```bash
cd worker
python -m venv venv
venv\Scripts\activate
pip install -r ../backend/requirements.txt
copy .env.example .env
```
Ensure `.env` matches backend values. Then:
```bash
python worker.py
```

## 4) Frontend
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

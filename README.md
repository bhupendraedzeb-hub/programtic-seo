# Programmatic SEO SaaS

Production-ready Programmatic SEO SaaS built with Next.js, FastAPI, Supabase, and Redis.

## Features
- Supabase Auth (signup, login, logout, password reset)
- Template editor with variable parsing
- Single page generation
- Bulk CSV generation with RQ worker
- SEO safeguards: word count, title/description length, duplicate checks
- Supabase Storage uploads (public URLs)

## Structure
```
/frontend   Next.js app
/backend    FastAPI API
/worker     RQ worker
/docs       Setup guides
/supabase   SQL schema
```

## Quick Start
See:
- `docs/SETUP.md`
- `docs/SUPABASE_SETUP.md`

## Environments
Frontend: `frontend/.env.local`  
Backend: `backend/.env`  
Worker: `worker/.env`

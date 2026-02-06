# Supabase Setup

## 1) Create Project
Create a project in Supabase and note:
- Project URL
- `anon` public key
- `service_role` key
- JWT secret

## 2) Database Schema
Open SQL Editor and run `supabase/schema.sql`.

## 3) Storage Bucket
Create a public bucket named `generated-pages`:
- Enable public access
- Confirm the storage policies in `supabase/schema.sql` are applied

## 4) Auth Settings
Under Authentication:
- Enable email/password
- Set redirect URL for password reset:
  - `http://localhost:3000/auth/reset-password`
  - Add production URL when deployed

## 5) Environment Variables
Backend `backend/.env`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_STORAGE_BUCKET`

Frontend `frontend/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

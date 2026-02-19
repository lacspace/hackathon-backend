-- Run this SQL in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New Query)

-- Enable UUID extension (usually already enabled in Supabase)
create extension if not exists "pgcrypto";

-- Profiles table
create table if not exists profiles (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    genes       jsonb not null default '[]'::jsonb,
    file_path   text,
    file_name   text,
    uploaded_at timestamptz default now(),
    created_at  timestamptz default now(),
    updated_at  timestamptz default now()
);

-- Optional: Enable Row Level Security (RLS)
-- For a hackathon you may want to disable it or make it public:
alter table profiles enable row level security;

-- Allow all operations for the anon key (public access for hackathon):
create policy "Allow public read"
    on profiles for select using (true);

create policy "Allow public insert"
    on profiles for insert with check (true);

create policy "Allow public update"
    on profiles for update using (true);

create policy "Allow public delete"
    on profiles for delete using (true);

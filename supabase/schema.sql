-- Run this once in Supabase SQL Editor to set up the debts table.
-- Project Settings > SQL Editor > New query > paste & run.

create table if not exists public.debts (
  id text primary key,
  name text not null,
  bank text not null,
  amount numeric not null default 0,
  due_date date not null,
  status text not null default 'belum',
  note text default '',
  created_at timestamptz not null default now()
);

create index if not exists debts_created_at_idx on public.debts (created_at desc);
create index if not exists debts_name_idx on public.debts (lower(name));

alter table public.debts enable row level security;

-- Open policies: anon key has full access. Suitable for single-user / personal app
-- with hardcoded admin login. For multi-user, add auth.users foreign key and
-- per-user RLS policies instead.
drop policy if exists "debts_select_all" on public.debts;
drop policy if exists "debts_insert_all" on public.debts;
drop policy if exists "debts_update_all" on public.debts;
drop policy if exists "debts_delete_all" on public.debts;

create policy "debts_select_all" on public.debts for select using (true);
create policy "debts_insert_all" on public.debts for insert with check (true);
create policy "debts_update_all" on public.debts for update using (true);
create policy "debts_delete_all" on public.debts for delete using (true);

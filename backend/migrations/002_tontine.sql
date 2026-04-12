-- Tontines groups
create table tontines (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  contribution_amount decimal not null,
  frequency text check (frequency in ('daily','weekly','monthly')),
  cycle_length int,
  is_certified boolean default false,
  created_at timestamptz default now()
);

-- Members (extends profiles)
create table members (
  id uuid references auth.users primary key,
  full_name text,
  phone_number text unique,
  trust_score int default 500,
  tontine_id uuid references tontines(id),
  created_at timestamptz default now()
);

-- Contributions
create table contributions (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id),
  tontine_id uuid references tontines(id),
  amount decimal,
  status text check (status in ('pending','paid','late','missed')),
  payment_date timestamptz,
  due_date timestamptz
);

-- Collateral locks
create table collateral_locks (
  id uuid default gen_random_uuid() primary key,
  tontine_id uuid references tontines(id),
  locked_amount decimal,
  status text check (status in ('locked','released')),
  created_at timestamptz default now()
);

-- Loans bridge
create table loans (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id),
  tontine_id uuid references tontines(id),
  amount decimal,
  status text check (status in ('pending','approved','defaulted','repaid')),
  created_at timestamptz default now()
);

-- Enable RLS for these tables
alter table tontines enable row level security;
alter table members enable row level security;
alter table contributions enable row level security;
alter table collateral_locks enable row level security;
alter table loans enable row level security;

-- Policies: members can view their tontines
create policy "Members view tontines" on tontines for select using (exists (select 1 from members where members.tontine_id = tontines.id and members.id = auth.uid()));
create policy "Members view own contributions" on contributions for select using (member_id = auth.uid());
-- etc. (simplifié)

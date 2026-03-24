-- 1. USERS TABLE
create table users (
  id uuid primary key default auth.uid(),
  phone text unique,
  trust_score int default 50,
  expo_push_token text,
  created_at timestamp with time zone default now()
);

-- 2. KYC TABLE
create table kyc (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text,
  document_type text,
  document_number text,
  face_image_url text,
  id_image_url text,
  status text default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamp with time zone default now()
);

-- 3. GROUPS (TONTINES) TABLE
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount int not null,
  frequency text default 'monthly',
  owner_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- 4. GROUP MEMBERS TABLE
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  payout_order int,
  has_paid boolean default false,
  unique(group_id, user_id)
);

-- 5. CONTRIBUTIONS TABLE
create table contributions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id),
  user_id uuid references auth.users(id),
  amount int not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'failed')),
  created_at timestamp with time zone default now()
);

-- 6. PAYMENTS TABLE
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  amount int not null,
  provider text,
  status text,
  external_id text,
  created_at timestamp with time zone default now()
);

-- 7. USER METRICS TABLE
create table user_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) unique,
  total_contributions int default 0,
  late_payments int default 0,
  missed_payments int default 0,
  groups_joined int default 0,
  groups_completed int default 0,
  updated_at timestamp with time zone default now()
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) on delete cascade,
  title TEXT,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. INVITATIONS TABLE
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) on delete cascade,
  user_id UUID REFERENCES users(id) on delete cascade,
  invited_by UUID REFERENCES users(id) on delete cascade,
  status TEXT DEFAULT 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE RLS
alter table users enable row level security;
alter table kyc enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table contributions enable row level security;
alter table payments enable row level security;
alter table user_metrics enable row level security;
alter table notifications enable row level security;
alter table invitations enable row level security;

-- RLS POLICIES
create policy "Users can view own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);

create policy "Users can view own KYC" on kyc for select using (auth.uid() = user_id);
create policy "Users can insert own KYC" on kyc for insert with check (auth.uid() = user_id);

create policy "Anyone can view groups" on groups for select using (true);
create policy "Authenticated users can create groups" on groups for insert with check (auth.role() = 'authenticated');

create policy "Members can view group members" on group_members for select using (true);
create policy "Owners can manage members" on group_members for all using (
  exists (select 1 from groups where id = group_id and owner_id = auth.uid())
);

create policy "Users can view own contributions" on contributions for select using (auth.uid() = user_id);
create policy "Users can view own payments" on payments for select using (auth.uid() = user_id);
create policy "Users can view own metrics" on user_metrics for select using (auth.uid() = user_id);

create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can insert own notifications" on notifications for insert with check (auth.uid() = user_id);

create policy "Users can view own invitations" on invitations for select using (auth.uid() = user_id or auth.uid() = invited_by);
create policy "Users can insert invitations" on invitations for insert with check (auth.uid() = invited_by);

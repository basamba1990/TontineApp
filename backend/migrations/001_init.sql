-- Extension
create extension if not exists "pgcrypto";

-- Profiles (users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  phone_number text,
  country_code text default 'SN',
  preferred_currency text default 'XOF',
  kyc_status text default 'none',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wallets
create table wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  currency text not null,
  balance decimal(20,2) default 0.00,
  country_code text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, currency)
);

-- Transactions
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  wallet_id uuid references wallets(id) on delete cascade not null,
  amount decimal(20,2) not null,
  currency text not null,
  type text not null,
  status text default 'pending',
  description text,
  receiver_id uuid references profiles(id),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;

-- Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can view own wallets" on wallets for select using (auth.uid() = user_id);
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);

-- Trigger for new user
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name) values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  insert into public.wallets (user_id, currency, country_code) values (new.id, 'XOF', 'SN');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create table user_metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users unique,
  total_contributions int default 0,
  late_payments int default 0,
  missed_payments int default 0,
  groups_joined int default 0,
  groups_completed int default 0,
  updated_at timestamptz default now()
);

create table trust_scores (
  user_id uuid references auth.users primary key,
  score int default 500,
  factors jsonb,
  updated_at timestamptz default now()
);

alter table user_metrics enable row level security;
alter table trust_scores enable row level security;
create policy "Users can view own metrics" on user_metrics for select using (auth.uid() = user_id);
create policy "Users can view own trust score" on trust_scores for select using (auth.uid() = user_id);

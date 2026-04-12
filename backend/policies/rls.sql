-- Additional RLS policies for tontine tables
create policy "Members can view group members" on members for select using (tontine_id in (select tontine_id from members where id = auth.uid()));
create policy "Members can insert own contributions" on contributions for insert with check (member_id = auth.uid());

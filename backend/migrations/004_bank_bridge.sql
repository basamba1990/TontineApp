create view tontine_credit_view as
select
  t.id,
  t.name,
  avg(c.amount) as avg_contribution,
  count(c.id) filter (where c.status='paid') as total_paid,
  count(c.id) as total_contributions,
  (count(c.id) filter (where c.status='paid')::float / nullif(count(c.id),0)) as reliability
from tontines t
join contributions c on t.id = c.tontine_id
group by t.id;

-- Grant access to bank role (à définir)
-- grant select on tontine_credit_view to bank_role;

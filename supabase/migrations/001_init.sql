create extension if not exists pgcrypto;

create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  platform text not null default 'threads' check (platform in ('threads','instagram','x')),
  username text not null,
  profile_id text,
  display_name text,
  follower_count integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(owner_id, platform, username)
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid not null references competitors(id) on delete cascade,
  platform_post_id text not null,
  text_content text,
  permalink text,
  media_type text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  unique(competitor_id, platform_post_id)
);

create table if not exists post_metric_snapshots (
  id bigserial primary key,
  post_id uuid not null references posts(id) on delete cascade,
  likes integer default 0,
  replies integer default 0,
  reposts integer default 0,
  quotes integer default 0,
  captured_at timestamptz not null default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references competitors(id) on delete cascade,
  period_start timestamptz,
  period_end timestamptz,
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table competitors enable row level security;
alter table posts enable row level security;
alter table post_metric_snapshots enable row level security;
alter table analyses enable row level security;

create policy "owners manage competitors" on competitors for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners read posts" on posts for select using (exists(select 1 from competitors c where c.id=competitor_id and c.owner_id=auth.uid()));
create policy "owners read metrics" on post_metric_snapshots for select using (exists(select 1 from posts p join competitors c on c.id=p.competitor_id where p.id=post_id and c.owner_id=auth.uid()));
create policy "owners read analyses" on analyses for select using (exists(select 1 from competitors c where c.id=competitor_id and c.owner_id=auth.uid()));

create or replace view competitor_dashboard as
select
  c.id,
  c.username,
  c.display_name,
  c.follower_count,
  c.created_at,
  count(p.id) filter (where p.published_at >= now() - interval '7 days')::int as posts_7d,
  coalesce(round(avg(ms.engagement)) filter (where p.published_at >= now() - interval '7 days'), 0)::int as avg_engagement,
  least(100, round(
    coalesce(avg(ms.engagement), 0) / greatest(coalesce(c.follower_count, 1), 1) * 850
    + least(count(p.id) filter (where p.published_at >= now() - interval '7 days') * 2.2, 25)
    + least(coalesce(avg(ms.engagement), 0) / 8, 25)
  ))::int as radar_score
from competitors c
left join posts p on p.competitor_id = c.id
left join lateral (
  select (likes + replies + reposts + quotes)::numeric as engagement
  from post_metric_snapshots s
  where s.post_id = p.id
  order by captured_at desc
  limit 1
) ms on true
group by c.id;

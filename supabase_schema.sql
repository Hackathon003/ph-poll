-- =============================================
-- PH POLL 2028 — SUPABASE SQL SCHEMA
-- Copy-paste this into your Supabase SQL editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- CANDIDATES TABLE
-- =============================================
create table candidates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  party text not null,
  position text not null check (position in ('president', 'vice_president', 'senator')),
  photo_url text,
  bio text,
  platform text,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- VOTES TABLE
-- =============================================
create table votes (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade,
  position text not null check (position in ('president', 'vice_president', 'senator')),
  ip_hash text not null,
  cookie_id text not null,
  created_at timestamptz default now()
);

-- Prevent duplicate votes: one per IP per position
create unique index votes_ip_position_unique on votes(ip_hash, position);

-- Prevent duplicate votes: one per cookie per position
create unique index votes_cookie_position_unique on votes(cookie_id, position);

-- =============================================
-- COMMENTS TABLE
-- =============================================
create table comments (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade,
  content text not null,
  ip_hash text not null,
  created_at timestamptz default now()
);

create index comments_ip_idx on comments(ip_hash);

-- =============================================
-- VOTE COUNTS VIEW (for fast reads)
-- =============================================
create view vote_counts as
select
  c.id,
  c.name,
  c.party,
  c.position,
  c.photo_url,
  c.sort_order,
  count(v.id) as vote_count
from candidates c
left join votes v on v.candidate_id = c.id
where c.active = true
group by c.id, c.name, c.party, c.position, c.photo_url, c.sort_order
order by c.position, vote_count desc;

-- =============================================
-- HOURLY ANALYTICS VIEW
-- =============================================
create view hourly_votes as
select
  date_trunc('hour', created_at) as hour,
  position,
  count(*) as vote_count
from votes
group by hour, position
order by hour desc;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table candidates enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;

create policy "Candidates are public" on candidates
  for select using (true);

create policy "Anyone can vote" on votes
  for insert with check (true);

create policy "Votes are public" on votes
  for select using (true);

create policy "Anyone can comment" on comments
  for insert with check (true);

create policy "Comments are public" on comments
  for select using (true);

-- =============================================
-- SEED DATA — 2028 PHILIPPINE ELECTIONS SURVEY
-- =============================================

-- PRESIDENTIAL CANDIDATES
insert into candidates (name, party, position, sort_order) values
  ('Ferdinand "Bongbong" Marcos Jr.', 'Partido Federal ng Pilipinas', 'president', 1),
  ('Sara Duterte', 'Hugpong ng Pagbabago', 'president', 2),
  ('Leni Robredo', 'Liberal Party', 'president', 3),
  ('Manny Pacquiao', 'Promdi', 'president', 4),
  ('Vico Sotto', 'Independent', 'president', 5);

-- VICE PRESIDENTIAL CANDIDATES
insert into candidates (name, party, position, sort_order) values
  ('Tito Sotto', 'NPC', 'vice_president', 1),
  ('Ping Lacson', 'Partido Reporma', 'vice_president', 2),
  ('Kiko Pangilinan', 'Liberal Party', 'vice_president', 3),
  ('Chiz Escudero', 'Independent', 'vice_president', 4),
  ('Alan Peter Cayetano', 'Nacionalista Party', 'vice_president', 5);

-- SENATORS
insert into candidates (name, party, position, sort_order) values
  -- Current senators likely to run again
  ('Cynthia Villar', 'Nacionalista Party', 'senator', 1),
  ('Bong Go', 'PDP-Laban', 'senator', 2),
  ('Robin Padilla', 'PDP-Laban', 'senator', 3),
  ('Lito Lapid', 'Nacionalista Party', 'senator', 4),
  ('Jinggoy Estrada', 'PMP', 'senator', 5),
  ('Raffy Tulfo', 'Independent', 'senator', 6),
  ('Risa Hontiveros', 'Akbayan', 'senator', 7),
  ('Win Gatchalian', 'NPC', 'senator', 8),
  ('Joel Villanueva', 'CIBAC', 'senator', 9),
  ('Pia Cayetano', 'Nacionalista Party', 'senator', 10),
  ('Francis Tolentino', 'PDP-Laban', 'senator', 11),
  ('Ronald dela Rosa', 'PDP-Laban', 'senator', 12),
  ('Imee Marcos', 'Nacionalista Party', 'senator', 13),
  ('JV Ejercito', 'NPC', 'senator', 14),
  ('Sherwin Gatchalian', 'NPC', 'senator', 15),
  -- Failed 2022 candidates
  ('Leody de Guzman', 'PLM', 'senator', 16),
  ('Doc Willie Ong', 'Aksyon Demokratiko', 'senator', 17),
  ('Neri Colmenares', 'Makabayan', 'senator', 18),
  ('Luke Espiritu', 'PLM', 'senator', 19),
  ('Samira Gutoc', 'Liberal Party', 'senator', 20),
  ('Erin Tañada', 'Liberal Party', 'senator', 21),
  ('Chel Diokno', 'Liberal Party', 'senator', 22),
  -- New faces / likely candidates
  ('Erwin Tulfo', 'Independent', 'senator', 23),
  ('Ramon Tulfo', 'Independent', 'senator', 24),
  ('Willie Revillame', 'Independent', 'senator', 25),
  ('Herbert Bautista', 'Liberal Party', 'senator', 26),
  ('Doc Manny Cabochan', 'Independent', 'senator', 27),
  ('Greco Belgica', 'Independent', 'senator', 28),
  ('Abby Binay', 'UNA', 'senator', 29),
  ('Nancy Binay', 'UNA', 'senator', 30);

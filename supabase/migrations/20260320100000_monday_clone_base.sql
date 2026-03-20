-- Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);
alter table public.workspaces enable row level security;
create policy "Authenticated users can read workspaces" on public.workspaces for select to authenticated using (true);
create policy "Authenticated users can insert workspaces" on public.workspaces for insert to authenticated with check (true);
create policy "Authenticated users can update workspaces" on public.workspaces for update to authenticated using (true);

-- Folders
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  position int default 0,
  created_at timestamptz default now()
);
alter table public.folders enable row level security;
create policy "Authenticated users can read folders" on public.folders for select to authenticated using (true);
create policy "Authenticated users can insert folders" on public.folders for insert to authenticated with check (true);
create policy "Authenticated users can update folders" on public.folders for update to authenticated using (true);
create policy "Authenticated users can delete folders" on public.folders for delete to authenticated using (true);

-- Boards
create table public.boards (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.folders(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  board_type text default 'general',
  department text,
  position int default 0,
  created_at timestamptz default now()
);
alter table public.boards enable row level security;
create policy "Authenticated users can read boards" on public.boards for select to authenticated using (true);
create policy "Authenticated users can insert boards" on public.boards for insert to authenticated with check (true);
create policy "Authenticated users can update boards" on public.boards for update to authenticated using (true);
create policy "Authenticated users can delete boards" on public.boards for delete to authenticated using (true);

-- Groups
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references public.boards(id) on delete cascade not null,
  name text not null,
  color text default '#579bfc',
  position int default 0,
  collapsed bool default false,
  created_at timestamptz default now()
);
alter table public.groups enable row level security;
create policy "Authenticated users can read groups" on public.groups for select to authenticated using (true);
create policy "Authenticated users can insert groups" on public.groups for insert to authenticated with check (true);
create policy "Authenticated users can update groups" on public.groups for update to authenticated using (true);
create policy "Authenticated users can delete groups" on public.groups for delete to authenticated using (true);

-- Board Columns
create table public.board_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references public.boards(id) on delete cascade not null,
  name text not null,
  column_type text not null default 'text',
  settings jsonb default '{}',
  position int default 0,
  created_at timestamptz default now()
);
alter table public.board_columns enable row level security;
create policy "Authenticated users can read board_columns" on public.board_columns for select to authenticated using (true);
create policy "Authenticated users can insert board_columns" on public.board_columns for insert to authenticated with check (true);
create policy "Authenticated users can update board_columns" on public.board_columns for update to authenticated using (true);
create policy "Authenticated users can delete board_columns" on public.board_columns for delete to authenticated using (true);

-- Items
create table public.items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references public.boards(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  parent_item_id uuid references public.items(id) on delete cascade,
  name text not null,
  description text,
  position int default 0,
  created_at timestamptz default now()
);
alter table public.items enable row level security;
create policy "Authenticated users can read items" on public.items for select to authenticated using (true);
create policy "Authenticated users can insert items" on public.items for insert to authenticated with check (true);
create policy "Authenticated users can update items" on public.items for update to authenticated using (true);
create policy "Authenticated users can delete items" on public.items for delete to authenticated using (true);

-- Column Values
create table public.column_values (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items(id) on delete cascade not null,
  column_id uuid references public.board_columns(id) on delete cascade not null,
  value text,
  created_at timestamptz default now(),
  unique(item_id, column_id)
);
alter table public.column_values enable row level security;
create policy "Authenticated users can read column_values" on public.column_values for select to authenticated using (true);
create policy "Authenticated users can insert column_values" on public.column_values for insert to authenticated with check (true);
create policy "Authenticated users can update column_values" on public.column_values for update to authenticated using (true);
create policy "Authenticated users can delete column_values" on public.column_values for delete to authenticated using (true);

-- Seed data
insert into public.workspaces (id, name) values ('00000000-0000-0000-0000-000000000001', 'Proativa Jr');

insert into public.folders (id, workspace_id, name, position) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Projetos', 0),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Comercial', 1),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Vice-Presidência', 2),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Presidência', 3);

insert into public.boards (workspace_id, folder_id, name, department, position) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Projetos Ativos', 'projetos', 0),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Inovação', 'projetos', 1),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Pipeline de Vendas', 'comercial', 0),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'CRM', 'comercial', 1),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'Gente e Gestão', 'vp', 0),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'Financeiro', 'vp', 1),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', 'Relação Institucional', 'presidencia', 0),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', 'MEJ', 'presidencia', 1);

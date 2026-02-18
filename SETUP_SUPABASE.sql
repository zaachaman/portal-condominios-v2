-- ============================================
-- PORTAL CONDOMINIOS DEL VALLE 2
-- Ejecuta este SQL en Supabase > SQL Editor
-- ============================================

-- 1. PROFILES (usuarios del sistema)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'resident' check (role in ('admin', 'resident')),
  house_number int,
  resident_name text,
  email text,
  created_at timestamp with time zone default now()
);

-- 2. PAYMENTS (cargos y pagos por casa)
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  house_id uuid references profiles(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null,
  amount numeric(10,2) not null,
  status text default 'pending' check (status in ('pending', 'paid')),
  description text,
  created_at timestamp with time zone default now()
);

-- 3. RECEIPTS (comprobantes de pago)
create table if not exists receipts (
  id uuid default gen_random_uuid() primary key,
  house_id uuid references profiles(id) on delete cascade,
  payment_id uuid references payments(id) on delete set null,
  file_url text not null,
  file_name text,
  uploaded_by text default 'resident' check (uploaded_by in ('admin', 'resident')),
  uploaded_at timestamp with time zone default now(),
  notes text
);

-- 4. ANNOUNCEMENTS (anuncios del admin)
create table if not exists announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  is_pinned boolean default false,
  created_by text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table profiles enable row level security;
alter table payments enable row level security;
alter table receipts enable row level security;
alter table announcements enable row level security;

-- PROFILES: cada usuario ve solo su perfil, admin ve todos
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Admin can view all profiles" on profiles
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Service can insert profiles" on profiles
  for insert with check (true);

-- PAYMENTS: residentes ven solo los suyos, admin ve todos
create policy "Residents view own payments" on payments
  for select using (house_id = auth.uid());

create policy "Admin manages all payments" on payments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- RECEIPTS: residentes ven y crean los suyos, admin ve todos
create policy "Residents manage own receipts" on receipts
  for all using (house_id = auth.uid());

create policy "Admin manages all receipts" on receipts
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ANNOUNCEMENTS: todos pueden leer, solo admin puede escribir
create policy "Everyone can read announcements" on announcements
  for select using (true);

create policy "Admin manages announcements" on announcements
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- STORAGE BUCKET para recibos
-- ============================================
-- Ve a Supabase > Storage > New Bucket
-- Nombre: receipts
-- Public: SI (para poder ver los archivos)

-- ============================================
-- CREAR TU CUENTA DE ADMIN
-- ============================================
-- 1. Ve a Supabase > Authentication > Users > Add User
-- 2. Email: tu correo, Password: tu contraseña
-- 3. Copia el UUID del usuario creado
-- 4. Ejecuta esto (reemplaza TU_UUID_AQUI):

-- insert into profiles (id, role, resident_name, email)
-- values ('TU_UUID_AQUI', 'admin', 'Administrador', 'tu@correo.com');

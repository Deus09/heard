-- Supabase Dashboard > SQL Editor'de çalıştırılacak SQL

-- Profiles tablosu (ek kullanıcı bilgileri için)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments tablosu
create table comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  username text not null,
  business_name text not null,
  city text not null,
  district text not null,
  experience text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  anonymous boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Politikaları
alter table profiles enable row level security;
alter table comments enable row level security;

-- Profiles: Herkes okuyabilir, sadece kendi profilini güncelleyebilir
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Comments: Herkes okuyabilir, giriş yapanlar yazabilir
create policy "Comments are viewable by everyone"
  on comments for select
  using ( true );

create policy "Authenticated users can insert comments"
  on comments for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can delete own comments"
  on comments for delete
  using ( auth.uid() = user_id );

-- Trigger: Profile otomatik oluştur
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes (performans için)
create index comments_user_id_idx on comments(user_id);
create index comments_created_at_idx on comments(created_at desc);
create index comments_city_idx on comments(city);
create index comments_business_name_idx on comments(business_name);

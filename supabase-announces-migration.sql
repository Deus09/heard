-- Duyurular (Announces) tablosu
create table announces (
  id uuid default gen_random_uuid() primary key,
  comment_id uuid references comments(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade,
  user_identifier text not null, -- Kullanıcı giriş yapmamışsa IP veya session ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(comment_id, user_identifier) -- Aynı kullanıcı bir yorumu birden fazla duyuramaz
);

-- Row Level Security (RLS) Politikaları
alter table announces enable row level security;

-- Announces: Herkes okuyabilir
create policy "Announces are viewable by everyone"
  on announces for select
  using ( true );

-- Announces: Herkes ekleyebilir
create policy "Anyone can insert announces"
  on announces for insert
  with check ( true );

-- Announces: Kullanıcı kendi duyurularını silebilir
create policy "Users can delete own announces"
  on announces for delete
  using ( 
    auth.uid() = user_id OR 
    (user_id is null AND user_identifier = current_setting('request.jwt.claims', true)::json->>'user_identifier')
  );

-- Indexes (performans için)
create index announces_comment_id_idx on announces(comment_id);
create index announces_user_identifier_idx on announces(user_identifier);
create index announces_created_at_idx on announces(created_at desc);

-- 1. Create Whitelist Table
-- Tabela para armazenar emails permitidos
create table public.whitelist (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS (Segurança)
alter table public.whitelist enable row level security;
-- Ninguém no frontend pode ler ou escrever nessa tabela diretamente, apenas o Admin no banco de dados.

-- 3. Insert Allowed Emails (Donos)
insert into public.whitelist (email) values 
  ('caiorarity@gmail.com'),
  ('wallacy.non@gmail.com')
on conflict (email) do nothing;

-- 4. Função para verificar whitelist ANTES de criar o usuário
-- Como o Supabase Auth não tem um trigger "before insert" fácil de bloquear sem extender,
-- usaremos uma Trigger Function no "users" que DELETA o usuário se não estiver na whitelist.
-- Isso efetivamente bloqueia o login/cadastro.

create or replace function public.check_whitelist()
returns trigger as $$
begin
  if not exists (select 1 from public.whitelist where email = new.email) then
    raise exception 'Email não autorizado. Contate o suporte para acesso.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to block signups
-- Dropa se já existir para evitar erro ao rodar novamente
drop trigger if exists check_whitelist_trigger on auth.users;

-- Esta trigger roda ANTES de inserir um novo usuario na tabela auth.users
create trigger check_whitelist_trigger
  before insert on auth.users
  for each row execute procedure public.check_whitelist();

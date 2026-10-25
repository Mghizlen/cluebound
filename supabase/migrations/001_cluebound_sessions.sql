create table if not exists public.cluebound_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_minutes integer not null check (duration_minutes in (15, 30, 60, 90, 120)),
  difficulty text not null check (difficulty in ('detective', 'investigator', 'master', 'expert', 'legendary')),
  device_hash text not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'completed')),
  cooldown_until timestamptz,
  progress jsonb not null default '{"version":1,"stageIndex":0,"solved":[]}'::jsonb,
  created_at timestamptz not null default now(),
  check (expires_at > started_at),
  check (cooldown_until is null or cooldown_until >= expires_at)
);

create unique index if not exists cluebound_one_active_session_per_user
  on public.cluebound_sessions(user_id) where status = 'active';
create index if not exists cluebound_sessions_user_created
  on public.cluebound_sessions(user_id, created_at desc);

alter table public.cluebound_sessions enable row level security;

create policy "Players can read their own sessions"
  on public.cluebound_sessions for select
  to authenticated using (auth.uid() = user_id);

revoke insert, update, delete on public.cluebound_sessions from anon, authenticated;

create or replace function public.cluebound_start_session(
  p_user_id uuid,
  p_duration_minutes integer,
  p_difficulty text,
  p_device_hash text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  current_session public.cluebound_sessions;
  created public.cluebound_sessions;
  expected_difficulty text;
begin
  if p_user_id is null or p_device_hash is null or length(p_device_hash) <> 64 then
    raise exception using errcode = '22023', message = 'Invalid session identity';
  end if;
  expected_difficulty := case p_duration_minutes when 15 then 'detective' when 30 then 'investigator' when 60 then 'master' when 90 then 'expert' when 120 then 'legendary' else null end;
  if expected_difficulty is null or p_difficulty <> expected_difficulty then
    raise exception using errcode = '22023', message = 'Invalid duration or difficulty';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select * into current_session from public.cluebound_sessions where user_id = p_user_id and status = 'active' order by created_at desc limit 1 for update;
  if current_session.id is not null and current_session.expires_at > now() then
    if current_session.device_hash <> p_device_hash then
      raise exception using errcode = 'P0001', message = 'An active session is bound to another device';
    end if;
    return jsonb_build_object('session_id', current_session.id, 'difficulty', current_session.difficulty, 'started_at', current_session.started_at, 'expires_at', current_session.expires_at, 'progress', current_session.progress, 'resumed', true);
  end if;
  if current_session.id is not null then
    update public.cluebound_sessions set status = 'expired', cooldown_until = current_session.expires_at + interval '24 hours' where id = current_session.id;
  end if;
  if exists (select 1 from public.cluebound_sessions where user_id = p_user_id and cooldown_until > now()) then
    raise exception using errcode = 'P0001', message = 'Account is in cooldown';
  end if;
  insert into public.cluebound_sessions(user_id, duration_minutes, difficulty, device_hash, expires_at)
  values (p_user_id, p_duration_minutes, p_difficulty, p_device_hash, now() + make_interval(mins => p_duration_minutes))
  returning * into created;
  return jsonb_build_object('session_id', created.id, 'difficulty', created.difficulty, 'started_at', created.started_at, 'expires_at', created.expires_at, 'progress', created.progress, 'resumed', false);
end;
$$;

create or replace function public.cluebound_session_status(p_user_id uuid, p_device_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare current_session public.cluebound_sessions; cooldown timestamptz;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select * into current_session from public.cluebound_sessions where user_id = p_user_id and status = 'active' order by created_at desc limit 1 for update;
  if current_session.id is not null and current_session.expires_at <= now() then
    update public.cluebound_sessions set status = 'expired', cooldown_until = current_session.expires_at + interval '24 hours' where id = current_session.id returning * into current_session;
  end if;
  select max(cooldown_until) into cooldown from public.cluebound_sessions where user_id = p_user_id and cooldown_until > now();
  if current_session.id is not null and current_session.status = 'active' then
    return jsonb_build_object('state', 'active', 'same_device', current_session.device_hash = p_device_hash, 'session_id', current_session.id, 'duration_minutes', current_session.duration_minutes, 'difficulty', current_session.difficulty, 'started_at', current_session.started_at, 'expires_at', current_session.expires_at, 'progress', current_session.progress);
  end if;
  if cooldown is not null then return jsonb_build_object('state', 'cooldown', 'cooldown_until', cooldown); end if;
  return jsonb_build_object('state', 'eligible');
end;
$$;

revoke all on function public.cluebound_start_session(uuid, integer, text, text) from public, anon, authenticated;
revoke all on function public.cluebound_session_status(uuid, text) from public, anon, authenticated;
grant execute on function public.cluebound_start_session(uuid, integer, text, text) to service_role;
grant execute on function public.cluebound_session_status(uuid, text) to service_role;

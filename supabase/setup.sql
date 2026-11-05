-- CeroJale: ejecutar completo una vez en el SQL Editor de Supabase.
-- No elimina datos. Las tablas usan el prefijo cj_ para evitar otros proyectos.
begin;

create table if not exists public.cj_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  role text not null check (role in ('student', 'advisor')),
  created_at timestamptz not null default now()
);
create table if not exists public.cj_advisors (
  user_id uuid primary key references public.cj_profiles(user_id) on delete cascade,
  display_name text not null,
  specialty text not null default '',
  courses text[] not null default '{}',
  price numeric(8,2) not null default 30 check (price between 25 and 35),
  methodology text not null default ''
);
create table if not exists public.cj_slots (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid not null references public.cj_advisors(user_id) on delete cascade,
  starts_at timestamptz not null,
  modality text not null check (modality in ('Virtual','Presencial')),
  location text not null check (char_length(btrim(location)) between 2 and 200),
  active boolean not null default true
);
create table if not exists public.cj_bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.cj_profiles(user_id),
  advisor_id uuid not null references public.cj_advisors(user_id),
  slot_id uuid not null references public.cj_slots(id),
  student_name text not null,
  advisor_name text not null,
  course text not null,
  starts_at timestamptz not null,
  modality text not null check (modality in ('Virtual','Presencial')),
  location text not null,
  price numeric(8,2) not null check (price between 25 and 35),
  topic text not null check (char_length(btrim(topic)) between 1 and 240),
  status text not null default 'Pendiente' check (status in ('Pendiente','Confirmada','Realizada','Cancelada')),
  proposed_slot_id uuid references public.cj_slots(id),
  notice text,
  created_at timestamptz not null default now(),
  check (student_id <> advisor_id)
);
create table if not exists public.cj_reviews (
  booking_id uuid primary key references public.cj_bookings(id) on delete cascade,
  advisor_id uuid not null references public.cj_advisors(user_id),
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment)) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists cj_slots_advisor_time on public.cj_slots(advisor_id, starts_at);
create index if not exists cj_bookings_student_time on public.cj_bookings(student_id, starts_at);
create index if not exists cj_bookings_advisor_time on public.cj_bookings(advisor_id, starts_at);
create index if not exists cj_reviews_advisor on public.cj_reviews(advisor_id);

-- El rol se elige al registrarse. Cambiar los metadatos de Auth luego no cambia permisos.
create or replace function public.cj_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare chosen_role text; chosen_name text;
begin
  chosen_role := case when new.raw_user_meta_data->>'role' = 'advisor' then 'advisor' else 'student' end;
  chosen_name := left(btrim(coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email,'@',1), 'Usuario')),80);
  if char_length(chosen_name) < 2 then chosen_name := 'Usuario'; end if;
  insert into public.cj_profiles(user_id, display_name, role) values(new.id, chosen_name, chosen_role) on conflict do nothing;
  if chosen_role = 'advisor' then
    insert into public.cj_advisors(user_id, display_name) values(new.id, chosen_name) on conflict do nothing;
  end if;
  return new;
end;
$$;
drop trigger if exists cj_on_auth_user_created on auth.users;
create trigger cj_on_auth_user_created after insert on auth.users for each row execute function public.cj_new_user();
-- Si se creó una cuenta antes de ejecutar este archivo, generar su perfil también.
insert into public.cj_profiles(user_id, display_name, role)
select id, case when char_length(btrim(coalesce(raw_user_meta_data->>'display_name',''))) between 2 and 80 then btrim(raw_user_meta_data->>'display_name') else 'Usuario' end,
case when raw_user_meta_data->>'role'='advisor' then 'advisor' else 'student' end from auth.users on conflict do nothing;
insert into public.cj_advisors(user_id, display_name) select user_id, display_name from public.cj_profiles where role='advisor' on conflict do nothing;

alter table public.cj_profiles enable row level security;
alter table public.cj_advisors enable row level security;
alter table public.cj_slots enable row level security;
alter table public.cj_bookings enable row level security;
alter table public.cj_reviews enable row level security;

drop policy if exists cj_profile_read on public.cj_profiles;
create policy cj_profile_read on public.cj_profiles for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists cj_advisor_read on public.cj_advisors;
create policy cj_advisor_read on public.cj_advisors for select to authenticated using(true);
drop policy if exists cj_slot_read on public.cj_slots;
create policy cj_slot_read on public.cj_slots for select to authenticated using(active or advisor_id=(select auth.uid()));
drop policy if exists cj_booking_read on public.cj_bookings;
create policy cj_booking_read on public.cj_bookings for select to authenticated using(student_id=(select auth.uid()) or advisor_id=(select auth.uid()));
drop policy if exists cj_review_read on public.cj_reviews;
create policy cj_review_read on public.cj_reviews for select to authenticated using(true);

-- Sin escrituras directas: las transiciones se validan en funciones, no en el navegador.
revoke all on public.cj_profiles, public.cj_advisors, public.cj_slots, public.cj_bookings, public.cj_reviews from anon, authenticated;
grant select on public.cj_profiles, public.cj_advisors, public.cj_slots, public.cj_bookings, public.cj_reviews to authenticated;

-- Función privada: valida horarios y cruces para ambos participantes.
create or replace function public.cj_check_slot(p_slot uuid, p_student uuid, p_exclude uuid default null)
returns public.cj_slots language plpgsql security definer set search_path = '' as $$
declare s public.cj_slots;
begin
 select * into s from public.cj_slots where id=p_slot and active;
 if not found or s.starts_at <= now() then raise exception 'El horario ya no está disponible. Elige otro.'; end if;
 if exists(select 1 from public.cj_bookings b where b.status <> 'Cancelada' and (p_exclude is null or b.id<>p_exclude)
   and (b.advisor_id=s.advisor_id or b.student_id=p_student)
   and b.starts_at < s.starts_at + interval '45 minutes' and s.starts_at < b.starts_at + interval '45 minutes') then
   raise exception 'Ese horario está ocupado o se cruza con otra asesoría.';
 end if;
 return s;
end;
$$;
revoke all on function public.cj_check_slot(uuid,uuid,uuid) from public, anon, authenticated;

create or replace function public.cj_mutate(p_action text, p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); me public.cj_profiles; a public.cj_advisors; s public.cj_slots; b public.cj_bookings; result_id uuid; start_time timestamptz; course_list text[];
begin
 if u is null then raise exception 'Inicia sesión para continuar.'; end if;
 select * into me from public.cj_profiles where user_id=u;
 if not found then raise exception 'No se encontró tu perfil. Ejecuta setup.sql.'; end if;
 -- Serializa las mutaciones de este MVP para impedir reservas simultáneas superpuestas.
 perform pg_advisory_xact_lock(157001);
 if p_action='profile' then
   if me.role<>'advisor' then raise exception 'Solo los asesores pueden editar su oferta.'; end if;
   select array_agg(distinct btrim(value)) into course_list from jsonb_array_elements_text(p_data->'courses') as x(value) where btrim(value)<>'';
   if coalesce(cardinality(course_list),0) not between 1 and 20 or exists(select 1 from unnest(course_list) x where char_length(x)>100)
      or char_length(btrim(coalesce(p_data->>'specialty',''))) not between 2 and 100
      or char_length(btrim(coalesce(p_data->>'methodology',''))) not between 10 and 1500
      or coalesce((p_data->>'price')::numeric,0) not between 25 and 35 then
     raise exception 'Completa especialidad, cursos, metodología y un precio entre S/25 y S/35.';
   end if;
   update public.cj_advisors set specialty=btrim(p_data->>'specialty'), courses=course_list, price=(p_data->>'price')::numeric, methodology=btrim(p_data->>'methodology') where user_id=u;
 elsif p_action='slot_add' then
   if me.role<>'advisor' then raise exception 'Solo un asesor puede publicar horarios.'; end if;
   if not exists(select 1 from public.cj_advisors where user_id=u and cardinality(courses)>0) then raise exception 'Completa tu perfil y tus cursos primero.'; end if;
   start_time := (p_data->>'starts_at')::timestamptz;
   if start_time is null or start_time<=now() then raise exception 'Selecciona una fecha y hora futuras.'; end if;
   if exists(select 1 from public.cj_slots where advisor_id=u and active and starts_at<start_time+interval '45 minutes' and start_time<starts_at+interval '45 minutes') then raise exception 'El horario se cruza con otro que ya publicaste.'; end if;
   insert into public.cj_slots(advisor_id,starts_at,modality,location) values(u,start_time,p_data->>'modality',btrim(p_data->>'location')) returning id into result_id;
 elsif p_action='slot_remove' then
   if me.role<>'advisor' then raise exception 'Acceso denegado.'; end if;
   if exists(select 1 from public.cj_bookings where slot_id=(p_data->>'id')::uuid and status in ('Pendiente','Confirmada')) then raise exception 'No puedes eliminar un horario con una reserva activa.'; end if;
   update public.cj_slots set active=false where id=(p_data->>'id')::uuid and advisor_id=u;
   if not found then raise exception 'No se encontró ese horario.'; end if;
 elsif p_action='book' then
   if me.role<>'student' then raise exception 'Las reservas se realizan desde una cuenta de estudiante.'; end if;
   s := public.cj_check_slot((p_data->>'slot_id')::uuid,u);
   select * into a from public.cj_advisors where user_id=s.advisor_id;
   if not (p_data->>'course'=any(a.courses)) or p_data->>'course' is null then raise exception 'El asesor no ofrece ese curso.'; end if;
   insert into public.cj_bookings(student_id,advisor_id,slot_id,student_name,advisor_name,course,starts_at,modality,location,price,topic)
    values(u,a.user_id,s.id,me.display_name,a.display_name,p_data->>'course',s.starts_at,s.modality,s.location,a.price,btrim(p_data->>'topic')) returning id into result_id;
 else
   select * into b from public.cj_bookings where id=(p_data->>'id')::uuid;
   if not found or (b.student_id<>u and b.advisor_id<>u) then raise exception 'No tienes acceso a esa reserva.'; end if;
   if p_action='confirm' then
     if b.advisor_id<>u or b.status<>'Pendiente' then raise exception 'No puedes confirmar esta reserva.'; end if;
     s := public.cj_check_slot(b.slot_id,b.student_id,b.id);
     update public.cj_bookings set status='Confirmada' where id=b.id;
   elsif p_action='cancel' then
     if b.status<>'Pendiente' then raise exception 'Solo puedes cancelar solicitudes pendientes.'; end if;
     update public.cj_bookings set status='Cancelada', proposed_slot_id=null where id=b.id;
   elsif p_action='complete' then
     if b.advisor_id<>u or b.status<>'Confirmada' or b.proposed_slot_id is not null or b.starts_at+interval '45 minutes'>now() then raise exception 'La sesión debe haber terminado y no tener cambios pendientes.'; end if;
     update public.cj_bookings set status='Realizada' where id=b.id;
   elsif p_action='propose' then
     if b.student_id<>u or b.status<>'Confirmada' or b.proposed_slot_id is not null then raise exception 'No puedes proponer ese cambio.'; end if;
     s := public.cj_check_slot((p_data->>'slot_id')::uuid,b.student_id,b.id);
     if s.advisor_id<>b.advisor_id or s.starts_at=b.starts_at then raise exception 'Elige otro horario del mismo asesor.'; end if;
     update public.cj_bookings set proposed_slot_id=s.id,notice=null where id=b.id;
   elsif p_action in ('withdraw','reject_change','accept_change') then
     if b.status<>'Confirmada' or b.proposed_slot_id is null then raise exception 'La reserva no tiene un cambio pendiente.'; end if;
     if p_action='withdraw' and b.student_id<>u then raise exception 'Solo el estudiante puede retirar su propuesta.'; end if;
     if p_action in ('reject_change','accept_change') and b.advisor_id<>u then raise exception 'Solo el asesor puede resolver el cambio.'; end if;
     if p_action='accept_change' then
       s := public.cj_check_slot(b.proposed_slot_id,b.student_id,b.id);
       if s.advisor_id<>b.advisor_id then raise exception 'El horario no corresponde a este asesor.'; end if;
       update public.cj_bookings set slot_id=s.id,starts_at=s.starts_at,modality=s.modality,location=s.location,proposed_slot_id=null,notice='Reprogramación aceptada. Tu calendario ya muestra el nuevo horario.' where id=b.id;
     else
       update public.cj_bookings set proposed_slot_id=null, notice=case when p_action='withdraw' then 'Propuesta retirada. Se mantiene el horario original.' else 'Cambio rechazado. Se mantiene el horario original.' end where id=b.id;
     end if;
   elsif p_action='review' then
     if b.student_id<>u or b.status<>'Realizada' then raise exception 'Solo puedes reseñar tus asesorías realizadas.'; end if;
     if exists(select 1 from public.cj_reviews where booking_id=b.id) then raise exception 'Esta asesoría ya tiene una reseña.'; end if;
     insert into public.cj_reviews(booking_id,advisor_id,author_name,rating,comment) values(b.id,b.advisor_id,me.display_name,(p_data->>'rating')::integer,btrim(p_data->>'comment'));
   else raise exception 'Acción desconocida.';
   end if;
   result_id := b.id;
 end if;
 return jsonb_build_object('ok',true,'id',result_id);
end;
$$;
revoke all on function public.cj_new_user() from public, anon, authenticated;
revoke all on function public.cj_mutate(text,jsonb) from public, anon;
grant execute on function public.cj_mutate(text,jsonb) to authenticated;

-- Disponibilidad pública sin divulgar nombres, temas ni IDs de los estudiantes.
create or replace function public.cj_busy_slots() returns table(advisor_id uuid, starts_at timestamptz)
language sql stable security definer set search_path = '' as $$
 select b.advisor_id,b.starts_at from public.cj_bookings b where auth.uid() is not null and b.status in ('Pendiente','Confirmada') and b.starts_at+interval '45 minutes'>now();
$$;
revoke all on function public.cj_busy_slots() from public, anon;
grant execute on function public.cj_busy_slots() to authenticated;
commit;

-- Actualización: catálogo y solicitudes de cursos.
-- Ejecutar completo en Supabase > SQL Editor. Conserva las cuentas y reservas.
begin;
create table if not exists public.cj_courses (
 name text primary key,
 price numeric(8,2) not null check(price between 25 and 35),
 modalities text[] not null
);
insert into public.cj_courses(name,price,modalities) values
 ('Cálculo Diferencial',30,array['Virtual','Presencial']),
 ('Álgebra Lineal',25,array['Virtual']),
 ('Fundamentos de Programación',35,array['Virtual','Presencial']),
 ('Programación Orientada a Objetos',35,array['Virtual','Presencial']),
 ('Matemática Básica',25,array['Virtual']),
 ('Física General I',32,array['Presencial']),
 ('Física General II',32,array['Presencial']),
 ('Estadística Descriptiva',28,array['Virtual']),
 ('Probabilidad',28,array['Virtual']),
 ('Investigación de Operaciones',30,array['Presencial']),
 ('Procesos',30,array['Presencial'])
on conflict(name) do nothing;
create table if not exists public.cj_course_requests (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.cj_profiles(user_id) on delete cascade,
 student_name text not null,
 course text not null references public.cj_courses(name),
 starts_at timestamptz not null,
 modality text not null check(modality in ('Virtual','Presencial')),
 price numeric(8,2) not null check(price between 25 and 35),
 topic text not null check(char_length(btrim(topic)) between 1 and 240),
 status text not null default 'Pendiente' check(status in ('Pendiente','Asignada','Cancelada')),
 booking_id uuid references public.cj_bookings(id),
 created_at timestamptz not null default now()
);
create index if not exists cj_course_requests_student_time on public.cj_course_requests(student_id,starts_at);
alter table public.cj_courses enable row level security;
alter table public.cj_course_requests enable row level security;
drop policy if exists cj_courses_read on public.cj_courses;
create policy cj_courses_read on public.cj_courses for select to authenticated using(true);
drop policy if exists cj_course_requests_read on public.cj_course_requests;
create policy cj_course_requests_read on public.cj_course_requests for select to authenticated using(
 student_id=auth.uid() or (status='Pendiente' and starts_at>now() and exists(
 select 1 from public.cj_advisors a where a.user_id=auth.uid() and course=any(a.courses))));
revoke all on public.cj_courses,public.cj_course_requests from anon,authenticated;
grant select on public.cj_courses,public.cj_course_requests to authenticated;

-- También evita que una reserva con profesor se cruce con un horario solicitado.
create or replace function public.cj_check_slot(p_slot uuid,p_student uuid,p_exclude uuid default null)
returns public.cj_slots language plpgsql security definer set search_path='' as $$
declare s public.cj_slots;
begin
 select * into s from public.cj_slots where id=p_slot and active;
 if not found or s.starts_at<=now() then raise exception 'El horario ya no está disponible. Elige otro.'; end if;
 if exists(select 1 from public.cj_bookings b where b.status<>'Cancelada' and (p_exclude is null or b.id<>p_exclude)
 and (b.advisor_id=s.advisor_id or b.student_id=p_student)
 and b.starts_at<s.starts_at+interval '45 minutes' and s.starts_at<b.starts_at+interval '45 minutes')
 or exists(select 1 from public.cj_course_requests r where r.student_id=p_student and r.status='Pendiente'
 and r.starts_at<s.starts_at+interval '45 minutes' and s.starts_at<r.starts_at+interval '45 minutes') then
 raise exception 'Ese horario está ocupado o se cruza con otra asesoría.'; end if;
 return s;
end;
$$;
revoke all on function public.cj_check_slot(uuid,uuid,uuid) from public,anon,authenticated;

create or replace function public.cj_course_request(p_action text,p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); me public.cj_profiles; c public.cj_courses; r public.cj_course_requests;
 a public.cj_advisors; t timestamptz; rid uuid; sid uuid; bid uuid;
begin
 if u is null then raise exception 'Inicia sesión para continuar.'; end if;
 select * into me from public.cj_profiles where user_id=u;
 if not found then raise exception 'No se encontró tu perfil.'; end if;
 perform pg_advisory_xact_lock(157001);
 if p_action='create' then
  if me.role<>'student' then raise exception 'Solo estudiantes pueden solicitar cursos.'; end if;
  select * into c from public.cj_courses where name=p_data->>'course';
  if not found then raise exception 'El curso no está en el catálogo.'; end if;
  if p_data->>'modality' is null or not (p_data->>'modality'=any(c.modalities)) then raise exception 'Elige una modalidad ofrecida para este curso.'; end if;
  t:=(p_data->>'starts_at')::timestamptz;
  if t is null or t<=now() then raise exception 'Elige una fecha y hora futuras.'; end if;
  if exists(select 1 from public.cj_bookings b where b.student_id=u and b.status<>'Cancelada'
  and b.starts_at<t+interval '45 minutes' and t<b.starts_at+interval '45 minutes')
  or exists(select 1 from public.cj_course_requests x where x.student_id=u and x.status='Pendiente'
  and x.starts_at<t+interval '45 minutes' and t<x.starts_at+interval '45 minutes') then
  raise exception 'El horario se cruza con otra asesoría de tu calendario.'; end if;
  insert into public.cj_course_requests(student_id,student_name,course,starts_at,modality,price,topic)
  values(u,me.display_name,c.name,t,p_data->>'modality',c.price,btrim(p_data->>'topic')) returning id into rid;
 elsif p_action='cancel' then
  update public.cj_course_requests set status='Cancelada' where id=(p_data->>'id')::uuid and student_id=u and status='Pendiente' returning id into rid;
  if not found then raise exception 'La solicitud ya no está pendiente o no te pertenece.'; end if;
 elsif p_action='accept' then
  select * into r from public.cj_course_requests where id=(p_data->>'id')::uuid and status='Pendiente' and starts_at>now();
  if not found then raise exception 'La solicitud ya no está disponible.'; end if;
  select * into a from public.cj_advisors where user_id=u and r.course=any(courses);
  if not found or me.role<>'advisor' or u=r.student_id then raise exception 'Solo puede aceptar un asesor que enseñe ese curso.'; end if;
  -- Quitar del conjunto pendiente antes de comprobar cruces. Si falla, la transacción revierte.
  update public.cj_course_requests set status='Asignada' where id=r.id;
  if char_length(btrim(coalesce(p_data->>'location',''))) not between 2 and 200 then raise exception 'Indica cómo coordinar o dónde será la sesión.'; end if;
  if exists(select 1 from public.cj_slots where advisor_id=u and active and starts_at=r.starts_at and modality=r.modality) then
   select id into sid from public.cj_slots where advisor_id=u and active and starts_at=r.starts_at and modality=r.modality limit 1;
  else
   if exists(select 1 from public.cj_slots where advisor_id=u and active and starts_at<r.starts_at+interval '45 minutes' and r.starts_at<starts_at+interval '45 minutes') then
    raise exception 'La solicitud se cruza con otro horario que publicaste.'; end if;
   insert into public.cj_slots(advisor_id,starts_at,modality,location) values(u,r.starts_at,r.modality,btrim(p_data->>'location')) returning id into sid;
  end if;
  perform public.cj_check_slot(sid,r.student_id);
  insert into public.cj_bookings(student_id,advisor_id,slot_id,student_name,advisor_name,course,starts_at,modality,location,price,topic,status)
  values(r.student_id,u,sid,r.student_name,a.display_name,r.course,r.starts_at,r.modality,btrim(p_data->>'location'),r.price,r.topic,'Confirmada') returning id into bid;
  update public.cj_course_requests set booking_id=bid where id=r.id;
  rid:=r.id;
 else raise exception 'Acción no válida.';
 end if;
 return jsonb_build_object('id',rid);
end;
$$;
revoke all on function public.cj_course_request(text,jsonb) from public,anon;
grant execute on function public.cj_course_request(text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;

-- Actualización: modalidad presencial y acceso docente.
-- CeroJale: presencial y modo docente para las cuentas actuales.
-- Ejecutar completo una vez. No borra cuentas, reservas ni solicitudes.
begin;
alter table public.cj_course_requests add column if not exists location text not null default '';
update public.cj_courses set modalities=array['Virtual','Presencial'] where name in (
 'Cálculo Diferencial','Álgebra Lineal','Fundamentos de Programación','Programación Orientada a Objetos',
 'Matemática Básica','Física General I','Física General II','Estadística Descriptiva','Probabilidad','Investigación de Operaciones','Procesos');
create or replace function public.cj_mutate(p_action text, p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); me public.cj_profiles; a public.cj_advisors; s public.cj_slots; b public.cj_bookings; result_id uuid; start_time timestamptz; course_list text[];
begin
 if u is null then raise exception 'Inicia sesión para continuar.'; end if;
 select * into me from public.cj_profiles where user_id=u;
 if not found then raise exception 'No se encontró tu perfil. Ejecuta setup.sql.'; end if;
 -- Serializa las mutaciones de este MVP para impedir reservas simultáneas superpuestas.
 perform pg_advisory_xact_lock(157001);
 if p_action='profile' then
   if not exists(select 1 from public.cj_advisors where user_id=u) then raise exception 'Solo los asesores pueden editar su oferta.'; end if;
   select array_agg(distinct btrim(value)) into course_list from jsonb_array_elements_text(p_data->'courses') as x(value) where btrim(value)<>'';
   if coalesce(cardinality(course_list),0) not between 1 and 20 or exists(select 1 from unnest(course_list) x where char_length(x)>100)
      or char_length(btrim(coalesce(p_data->>'specialty',''))) not between 2 and 100
      or char_length(btrim(coalesce(p_data->>'methodology',''))) not between 10 and 1500
      or coalesce((p_data->>'price')::numeric,0) not between 25 and 35 then
     raise exception 'Completa especialidad, cursos, metodología y un precio entre S/25 y S/35.';
   end if;
   update public.cj_advisors set specialty=btrim(p_data->>'specialty'), courses=course_list, price=(p_data->>'price')::numeric, methodology=btrim(p_data->>'methodology') where user_id=u;
 elsif p_action='slot_add' then
   if not exists(select 1 from public.cj_advisors where user_id=u) then raise exception 'Solo un asesor puede publicar horarios.'; end if;
   if not exists(select 1 from public.cj_advisors where user_id=u and cardinality(courses)>0) then raise exception 'Completa tu perfil y tus cursos primero.'; end if;
   start_time := (p_data->>'starts_at')::timestamptz;
   if start_time is null or start_time<=now() then raise exception 'Selecciona una fecha y hora futuras.'; end if;
   if exists(select 1 from public.cj_bookings where u in (student_id,advisor_id) and status<>'Cancelada' and starts_at<start_time+interval '45 minutes' and start_time<starts_at+interval '45 minutes')
   or exists(select 1 from public.cj_course_requests where student_id=u and status='Pendiente' and starts_at<start_time+interval '45 minutes' and start_time<starts_at+interval '45 minutes') then raise exception 'El horario se cruza con otra asesoría o solicitud de tu calendario.'; end if;
   if exists(select 1 from public.cj_slots where advisor_id=u and active and starts_at<start_time+interval '45 minutes' and start_time<starts_at+interval '45 minutes') then raise exception 'El horario se cruza con otro que ya publicaste.'; end if;
   insert into public.cj_slots(advisor_id,starts_at,modality,location) values(u,start_time,p_data->>'modality',btrim(p_data->>'location')) returning id into result_id;
 elsif p_action='slot_remove' then
   if not exists(select 1 from public.cj_advisors where user_id=u) then raise exception 'Acceso denegado.'; end if;
   if exists(select 1 from public.cj_bookings where slot_id=(p_data->>'id')::uuid and status in ('Pendiente','Confirmada')) then raise exception 'No puedes eliminar un horario con una reserva activa.'; end if;
   update public.cj_slots set active=false where id=(p_data->>'id')::uuid and advisor_id=u;
   if not found then raise exception 'No se encontró ese horario.'; end if;
 elsif p_action='book' then

   s := public.cj_check_slot((p_data->>'slot_id')::uuid,u);
   if s.advisor_id=u then raise exception 'No puedes reservar tu propia asesoría.'; end if;
   select * into a from public.cj_advisors where user_id=s.advisor_id;
   if not (p_data->>'course'=any(a.courses)) or p_data->>'course' is null then raise exception 'El asesor no ofrece ese curso.'; end if;
   insert into public.cj_bookings(student_id,advisor_id,slot_id,student_name,advisor_name,course,starts_at,modality,location,price,topic)
    values(u,a.user_id,s.id,me.display_name,a.display_name,p_data->>'course',s.starts_at,s.modality,s.location,a.price,btrim(p_data->>'topic')) returning id into result_id;
 else
   select * into b from public.cj_bookings where id=(p_data->>'id')::uuid;
   if not found or (b.student_id<>u and b.advisor_id<>u) then raise exception 'No tienes acceso a esa reserva.'; end if;
   if p_action='confirm' then
     if b.advisor_id<>u or b.status<>'Pendiente' then raise exception 'No puedes confirmar esta reserva.'; end if;
     s := public.cj_check_slot(b.slot_id,b.student_id,b.id);
     update public.cj_bookings set status='Confirmada' where id=b.id;
   elsif p_action='cancel' then
     if b.status<>'Pendiente' then raise exception 'Solo puedes cancelar solicitudes pendientes.'; end if;
     update public.cj_bookings set status='Cancelada', proposed_slot_id=null where id=b.id;
   elsif p_action='complete' then
     if b.advisor_id<>u or b.status<>'Confirmada' or b.proposed_slot_id is not null or b.starts_at+interval '45 minutes'>now() then raise exception 'La sesión debe haber terminado y no tener cambios pendientes.'; end if;
     update public.cj_bookings set status='Realizada' where id=b.id;
   elsif p_action='propose' then
     if b.student_id<>u or b.status<>'Confirmada' or b.proposed_slot_id is not null then raise exception 'No puedes proponer ese cambio.'; end if;
     s := public.cj_check_slot((p_data->>'slot_id')::uuid,b.student_id,b.id);
     if s.advisor_id<>b.advisor_id or s.starts_at=b.starts_at then raise exception 'Elige otro horario del mismo asesor.'; end if;
     update public.cj_bookings set proposed_slot_id=s.id,notice=null where id=b.id;
   elsif p_action in ('withdraw','reject_change','accept_change') then
     if b.status<>'Confirmada' or b.proposed_slot_id is null then raise exception 'La reserva no tiene un cambio pendiente.'; end if;
     if p_action='withdraw' and b.student_id<>u then raise exception 'Solo el estudiante puede retirar su propuesta.'; end if;
     if p_action in ('reject_change','accept_change') and b.advisor_id<>u then raise exception 'Solo el asesor puede resolver el cambio.'; end if;
     if p_action='accept_change' then
       s := public.cj_check_slot(b.proposed_slot_id,b.student_id,b.id);
       if s.advisor_id<>b.advisor_id then raise exception 'El horario no corresponde a este asesor.'; end if;
       update public.cj_bookings set slot_id=s.id,starts_at=s.starts_at,modality=s.modality,location=s.location,proposed_slot_id=null,notice='Reprogramación aceptada. Tu calendario ya muestra el nuevo horario.' where id=b.id;
     else
       update public.cj_bookings set proposed_slot_id=null, notice=case when p_action='withdraw' then 'Propuesta retirada. Se mantiene el horario original.' else 'Cambio rechazado. Se mantiene el horario original.' end where id=b.id;
     end if;
   elsif p_action='review' then
     if b.student_id<>u or b.status<>'Realizada' then raise exception 'Solo puedes reseñar tus asesorías realizadas.'; end if;
     if exists(select 1 from public.cj_reviews where booking_id=b.id) then raise exception 'Esta asesoría ya tiene una reseña.'; end if;
     insert into public.cj_reviews(booking_id,advisor_id,author_name,rating,comment) values(b.id,b.advisor_id,me.display_name,(p_data->>'rating')::integer,btrim(p_data->>'comment'));
   else raise exception 'Acción desconocida.';
   end if;
   result_id := b.id;
 end if;
 return jsonb_build_object('ok',true,'id',result_id);
end;
$$;
revoke all on function public.cj_new_user() from public, anon, authenticated;
revoke all on function public.cj_mutate(text,jsonb) from public, anon;
grant execute on function public.cj_mutate(text,jsonb) to authenticated;
create or replace function public.cj_check_slot(p_slot uuid,p_student uuid,p_exclude uuid default null)
returns public.cj_slots language plpgsql security definer set search_path='' as $$
declare s public.cj_slots;
begin
 select * into s from public.cj_slots where id=p_slot and active;
 if not found or s.starts_at<=now() then raise exception 'El horario ya no está disponible. Elige otro.'; end if;
 if exists(select 1 from public.cj_bookings b where b.status<>'Cancelada' and (p_exclude is null or b.id<>p_exclude)
 and (s.advisor_id in (b.advisor_id,b.student_id) or p_student in (b.advisor_id,b.student_id))
 and b.starts_at<s.starts_at+interval '45 minutes' and s.starts_at<b.starts_at+interval '45 minutes')
 or exists(select 1 from public.cj_course_requests r where r.student_id in (p_student,s.advisor_id) and r.status='Pendiente'
 and r.starts_at<s.starts_at+interval '45 minutes' and s.starts_at<r.starts_at+interval '45 minutes') then
 raise exception 'Ese horario está ocupado o se cruza con otra asesoría.'; end if;
 return s;
end;
$$;
revoke all on function public.cj_check_slot(uuid,uuid,uuid) from public,anon,authenticated;

create or replace function public.cj_course_request(p_action text,p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); me public.cj_profiles; c public.cj_courses; r public.cj_course_requests;
 a public.cj_advisors; t timestamptz; rid uuid; sid uuid; bid uuid;
begin
 if u is null then raise exception 'Inicia sesión para continuar.'; end if;
 select * into me from public.cj_profiles where user_id=u;
 if not found then raise exception 'No se encontró tu perfil.'; end if;
 perform pg_advisory_xact_lock(157001);
 if p_action='create' then

  select * into c from public.cj_courses where name=p_data->>'course';
  if not found then raise exception 'El curso no está en el catálogo.'; end if;
  if p_data->>'modality' is null or not (p_data->>'modality'=any(c.modalities)) then raise exception 'Elige una modalidad ofrecida para este curso.'; end if;
  t:=(p_data->>'starts_at')::timestamptz;
  if t is null or t<=now() then raise exception 'Elige una fecha y hora futuras.'; end if;
  if exists(select 1 from public.cj_bookings b where u in (b.student_id,b.advisor_id) and b.status<>'Cancelada'
  and b.starts_at<t+interval '45 minutes' and t<b.starts_at+interval '45 minutes')
  or exists(select 1 from public.cj_course_requests x where x.student_id=u and x.status='Pendiente'
  and x.starts_at<t+interval '45 minutes' and t<x.starts_at+interval '45 minutes') then
  raise exception 'El horario se cruza con otra asesoría de tu calendario.'; end if;
  if p_data->>'modality'='Presencial' and char_length(btrim(coalesce(p_data->>'location',''))) not between 2 and 200 then raise exception 'Indica el lugar propuesto para la asesoría presencial (2 a 200 caracteres).'; end if;
  insert into public.cj_course_requests(student_id,student_name,course,starts_at,modality,price,topic,location)
  values(u,me.display_name,c.name,t,p_data->>'modality',c.price,btrim(p_data->>'topic'),case when p_data->>'modality'='Presencial' then btrim(p_data->>'location') else 'Enlace por coordinar' end) returning id into rid;
 elsif p_action='cancel' then
  update public.cj_course_requests set status='Cancelada' where id=(p_data->>'id')::uuid and student_id=u and status='Pendiente' returning id into rid;
  if not found then raise exception 'La solicitud ya no está pendiente o no te pertenece.'; end if;
 elsif p_action='accept' then
  select * into r from public.cj_course_requests where id=(p_data->>'id')::uuid and status='Pendiente' and starts_at>now();
  if not found then raise exception 'La solicitud ya no está disponible.'; end if;
  select * into a from public.cj_advisors where user_id=u and r.course=any(courses);
  if not found or u=r.student_id then raise exception 'Solo puede aceptar un asesor que enseñe ese curso.'; end if;
  -- Quitar del conjunto pendiente antes de comprobar cruces. Si falla, la transacción revierte.
  update public.cj_course_requests set status='Asignada' where id=r.id;
  if char_length(btrim(coalesce(p_data->>'location',''))) not between 2 and 200 then raise exception 'Indica cómo coordinar o dónde será la sesión.'; end if;
  if exists(select 1 from public.cj_slots where advisor_id=u and active and starts_at=r.starts_at and modality=r.modality) then
   select id into sid from public.cj_slots where advisor_id=u and active and starts_at=r.starts_at and modality=r.modality limit 1;
  else
   if exists(select 1 from public.cj_slots where advisor_id=u and active and starts_at<r.starts_at+interval '45 minutes' and r.starts_at<starts_at+interval '45 minutes') then
    raise exception 'La solicitud se cruza con otro horario que publicaste.'; end if;
   insert into public.cj_slots(advisor_id,starts_at,modality,location) values(u,r.starts_at,r.modality,btrim(p_data->>'location')) returning id into sid;
  end if;
  perform public.cj_check_slot(sid,r.student_id);
  insert into public.cj_bookings(student_id,advisor_id,slot_id,student_name,advisor_name,course,starts_at,modality,location,price,topic,status)
  values(r.student_id,u,sid,r.student_name,a.display_name,r.course,r.starts_at,r.modality,btrim(p_data->>'location'),r.price,r.topic,'Confirmada') returning id into bid;
  update public.cj_course_requests set booking_id=bid where id=r.id;
  rid:=r.id;
 else raise exception 'Acción no válida.';
 end if;
 return jsonb_build_object('id',rid);
end;
$$;
revoke all on function public.cj_course_request(text,jsonb) from public,anon;
grant execute on function public.cj_course_request(text,jsonb) to authenticated;

-- Cada persona habilita únicamente su propio perfil docente.
create or replace function public.cj_enable_teaching(p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare me public.cj_profiles;
begin
 if auth.uid() is null then raise exception 'Inicia sesión para continuar.'; end if;
 select * into me from public.cj_profiles where user_id=auth.uid();
 if not found then raise exception 'No se encontró tu perfil.'; end if;
 perform pg_advisory_xact_lock(157001);
 insert into public.cj_advisors(user_id,display_name) values(me.user_id,me.display_name) on conflict do nothing;
 perform public.cj_mutate('profile',p_data);
 return jsonb_build_object('id',me.user_id);
end;
$$;
revoke all on function public.cj_enable_teaching(jsonb) from public,anon;
grant execute on function public.cj_enable_teaching(jsonb) to authenticated;
notify pgrst,'reload schema';
commit;

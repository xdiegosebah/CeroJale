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

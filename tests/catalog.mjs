import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
await db.exec(
  fs.readFileSync(new URL("../supabase/setup.sql", import.meta.url), "utf8"),
);
const ids = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
];
for (let i = 0; i < ids.length; i++)
  await db.query("insert into auth.users values($1,$2,$3)", [
    ids[i],
    `test${i}@example.test`,
    JSON.stringify({
      display_name: `Persona ${i}`,
      role: i < 2 ? "student" : "advisor",
    }),
  ]);
const as = async (i) =>
  db.exec(
    `reset role; select set_config('request.jwt.claim.sub','${ids[i]}',false); set role authenticated;`,
  );
const request = async (action, payload) =>
  (
    await db.query("select cj_course_request($1,$2) result", [
      action,
      JSON.stringify(payload),
    ])
  ).rows[0].result;
const mutate = async (action, payload) =>
  (
    await db.query("select cj_mutate($1,$2) result", [
      action,
      JSON.stringify(payload),
    ])
  ).rows[0].result;
const payload = {
  course: "Cálculo Diferencial",
  starts_at: "2099-06-01T16:00:00-05:00",
  modality: "Virtual",
  topic: "Límites",
  price: 1,
  student_id: ids[1],
};
await as(0);
assert.equal((await db.query("select * from cj_courses")).rows.length, 11);
const id = (await request("create", payload)).id;
let rows = (await db.query("select * from cj_course_requests")).rows;
assert.equal(Number(rows[0].price), 30);
assert.equal(rows[0].student_id, ids[0]);
await assert.rejects(() => request("create", payload));
await assert.rejects(() =>
  request("create", { ...payload, starts_at: "2099-06-01T16:30:00-05:00" }),
);
await assert.rejects(() =>
  request("create", { ...payload, starts_at: "2000-01-01T16:00:00-05:00" }),
);
await assert.rejects(() =>
  request("create", { ...payload, course: "Inventado" }),
);
await assert.rejects(() =>
  request("create", {
    ...payload,
    course: "Álgebra Lineal",
    modality: "Presencial",
  }),
);
await assert.rejects(() =>
  db.query("update cj_course_requests set status='Asignada'"),
);
await as(1);
assert.equal(
  (await db.query("select * from cj_course_requests")).rows.length,
  0,
);
await assert.rejects(() => request("cancel", { id }));
await assert.rejects(() => request("accept", { id, location: "Prueba" }));
await as(2);
assert.equal(
  (await db.query("select * from cj_course_requests")).rows.length,
  0,
);
await assert.rejects(() => request("accept", { id, location: "Prueba" }));
await mutate("profile", {
  specialty: "Matemáticas",
  courses: ["Cálculo Diferencial"],
  price: 35,
  methodology: "Práctica guiada de matemáticas.",
});
assert.equal(
  (await db.query("select * from cj_course_requests")).rows.length,
  1,
);
const slot = (
  await mutate("slot_add", {
    starts_at: payload.starts_at,
    modality: "Virtual",
    location: "Por coordinar",
  })
).id;
await as(0);
await assert.rejects(() =>
  mutate("book", {
    slot_id: slot,
    course: payload.course,
    topic: "Se cruza con mi solicitud",
  }),
);
await as(2);
await request("accept", { id, location: "Enlace por coordinar" });
await assert.rejects(() => request("accept", { id, location: "Duplicado" }));
let booking = (await db.query("select * from cj_bookings")).rows[0];
assert.equal(booking.status, "Confirmada");
assert.equal(Number(booking.price), 30);
assert.equal(
  new Date(booking.starts_at).toISOString(),
  new Date(payload.starts_at).toISOString(),
);
await as(0);
assert.equal(
  (await db.query("select * from cj_course_requests")).rows[0].status,
  "Asignada",
);
assert.equal((await db.query("select * from cj_bookings")).rows.length, 1);
const second = (
  await request("create", {
    ...payload,
    starts_at: "2099-06-02T16:00:00-05:00",
  })
).id;
await request("cancel", { id: second });
assert.equal(
  (await db.query("select * from cj_course_requests where id=$1", [second]))
    .rows[0].status,
  "Cancelada",
);
await request("create", { ...payload, starts_at: "2099-06-02T16:00:00-05:00" });
await db.exec("reset role;set role anon;");
await assert.rejects(() => db.query("select * from cj_course_requests"));
await assert.rejects(() => request("create", payload));
await db.exec("reset role;");
await db.exec(
  fs.readFileSync(new URL("../supabase/catalogo.sql", import.meta.url), "utf8"),
);
assert.equal((await db.query("select * from cj_courses")).rows.length, 11);
assert.equal((await db.query("select * from cj_bookings")).rows.length, 1);
console.log(
  "Catálogo OK: tarifas del servidor, cuenta propietaria, persistencia, RLS, cruces, cancelación, aceptación por profesor autorizado, sin duplicados y migración repetible.",
);
await db.close();

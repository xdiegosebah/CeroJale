import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(
  `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`,
);
await db.exec(
  fs.readFileSync(new URL("../supabase/setup.sql", import.meta.url), "utf8"),
);
console.log("SQL: tablas, funciones, trigger y políticas creados");
const ids = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444",
];
for (let i = 0; i < ids.length; i++)
  await db.query("insert into auth.users values($1,$2,$3)", [
    ids[i],
    `test${i}@example.test`,
    JSON.stringify({
      display_name: `Persona ${i}`,
      role: i < 2 ? "advisor" : "student",
    }),
  ]);
async function asUser(i) {
  await db.exec(
    `reset role; select set_config('request.jwt.claim.sub','${ids[i]}',false); set role authenticated;`,
  );
}
async function rpc(action, payload) {
  const r = await db.query("select public.cj_mutate($1,$2) as result", [
    action,
    JSON.stringify(payload),
  ]);
  return r.rows[0].result;
}
async function deny(action, payload) {
  await assert.rejects(() => rpc(action, payload));
}
await asUser(0);
await rpc("profile", {
  specialty: "Matemáticas",
  courses: ["Álgebra", "Cálculo"],
  price: 30,
  methodology: "Práctica guiada paso a paso.",
});
const s1 = (
  await rpc("slot_add", {
    starts_at: "2099-06-01T16:00:00-05:00",
    modality: "Virtual",
    location: "Meet por coordinar",
  })
).id;
const s2 = (
  await rpc("slot_add", {
    starts_at: "2099-06-02T17:00:00-05:00",
    modality: "Presencial",
    location: "Lugar de prueba",
  })
).id;
await deny("slot_add", {
  starts_at: "2099-06-01T16:30:00-05:00",
  modality: "Virtual",
  location: "Prueba",
});
await asUser(2);
assert.equal((await db.query("select * from cj_profiles")).rows.length, 1);
await deny("profile", {
  specialty: "Hack",
  courses: ["Hack"],
  price: 30,
  methodology: "No corresponde",
});
await assert.rejects(() => db.query("update cj_profiles set role='advisor'"));
const booking = (
  await rpc("book", { slot_id: s1, course: "Álgebra", topic: "Matrices" })
).id;
await deny("book", { slot_id: s1, course: "Álgebra", topic: "Duplicado" });
await asUser(3);
assert.equal((await db.query("select * from cj_bookings")).rows.length, 0);
assert.equal((await db.query("select * from cj_busy_slots()")).rows.length, 1);
await deny("cancel", { id: booking });
await deny("book", { slot_id: s1, course: "Álgebra", topic: "Ocupado" });
await asUser(1);
await deny("confirm", { id: booking });
assert.equal((await db.query("select * from cj_bookings")).rows.length, 0);
await asUser(0);
await rpc("confirm", { id: booking });
await deny("complete", { id: booking });
await deny("slot_remove", { id: s1 });
await asUser(2);
await rpc("propose", { id: booking, slot_id: s2 });
await deny("accept_change", { id: booking });
await asUser(0);
await rpc("reject_change", { id: booking });
assert.equal(
  (await db.query("select slot_id from cj_bookings")).rows[0].slot_id,
  s1,
);
await asUser(2);
await rpc("propose", { id: booking, slot_id: s2 });
await asUser(3);
const blocking = (
  await rpc("book", { slot_id: s2, course: "Cálculo", topic: "Límites" })
).id;
await asUser(0);
await deny("accept_change", { id: booking });
await rpc("cancel", { id: blocking });
await rpc("accept_change", { id: booking });
assert.equal(
  (await db.query("select slot_id from cj_bookings where id=$1", [booking]))
    .rows[0].slot_id,
  s2,
);
await asUser(2);
await deny("review", { id: booking, rating: 5, comment: "No finalizada" });
await db.exec("reset role");
await db.query(
  "update cj_bookings set starts_at='2000-01-01T10:00:00Z' where id=$1",
  [booking],
);
await asUser(0);
await rpc("complete", { id: booking });
await deny("review", {
  id: booking,
  rating: 5,
  comment: "Asesor no puede reseñarse",
});
await asUser(2);
await rpc("review", { id: booking, rating: 5, comment: "Ahora sí, muy claro" });
await deny("review", { id: booking, rating: 1, comment: "Duplicado" });
await asUser(3);
assert.equal((await db.query("select * from cj_reviews")).rows.length, 1);
assert.equal(
  (await db.query("select * from cj_bookings where id=$1", [booking])).rows
    .length,
  0,
);
await db.exec("reset role; set role anon;");
await assert.rejects(() => db.query("select * from cj_bookings"));
await deny("slot_add", {});
await db.exec("reset role;");
await db.exec(
  fs.readFileSync(new URL("../supabase/setup.sql", import.meta.url), "utf8"),
);
console.log(
  "SQL OK: aislamiento por cuenta, rol inmutable, acceso anónimo denegado, disponibilidad, cruces, aprobación, reprogramación con conflicto, cierre y reseñas; script repetible sin borrar datos.",
);
await db.close();

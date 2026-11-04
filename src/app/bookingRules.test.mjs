import test from "node:test";
import assert from "node:assert/strict";
import {
  isFutureSlot,
  localDate,
  overlaps,
  slotIsAvailable,
  validateBooking,
  validateBookingUpdate,
  validateNewSlot,
  sessionHasEnded,
  validateReschedule,
} from "./bookingRules.ts";

const slot = {
  id: "s1",
  advisorId: "roberto",
  date: "2099-06-15",
  time: "16:00",
  modality: "Virtual",
  location: "Sala virtual CeroJale",
};
const data = {
  studentName: "Carlos Andrade",
  advisorId: "roberto",
  advisorName: "Roberto Martínez",
  course: "Cálculo Diferencial",
  date: slot.date,
  time: slot.time,
  modality: slot.modality,
  location: slot.location,
  duration: 45,
  price: 30,
  topic: "Derivadas",
};
const booking = { ...data, id: "b1", status: "Pendiente", createdAt: "demo" };

test("las fechas locales no se convierten a UTC y los horarios pasados no se ofrecen", () => {
  assert.equal(localDate(new Date(2026, 0, 5, 23, 30)), "2026-01-05");
  assert.equal(isFutureSlot({ date: "2000-01-01", time: "10:00" }), false);
  assert.equal(slotIsAvailable({ ...slot, date: "2000-01-01" }, []), false);
});

test("se valida tema obligatorio y existencia del horario publicado", () => {
  assert.equal(validateBooking(data, [slot], []).ok, true);
  assert.equal(
    validateBooking({ ...data, topic: "   " }, [slot], []).ok,
    false,
  );
  assert.equal(validateBooking(data, [], []).ok, false);
});

test("una sesión de 45 minutos bloquea duplicados y solapamientos", () => {
  assert.equal(validateBooking(data, [slot], [booking]).ok, false);
  assert.equal(overlaps(slot, { ...slot, time: "16:30" }), true);
  assert.equal(overlaps(slot, { ...slot, time: "16:45" }), false);
  assert.equal(
    validateNewSlot({ ...slot, time: "16:30" }, "roberto", [slot]).ok,
    false,
  );
  assert.equal(
    validateNewSlot({ ...slot, time: "16:45" }, "roberto", [slot]).ok,
    true,
  );
});

test("se puede reservar el mismo curso otra fecha y reutilizar un horario cancelado", () => {
  const next = { ...slot, date: "2099-06-16" };
  assert.equal(
    validateBooking({ ...data, date: next.date }, [next], [booking]).ok,
    true,
  );
  assert.equal(
    validateBooking(data, [slot], [{ ...booking, status: "Cancelada" }]).ok,
    true,
  );
});

test("no se permite al estudiante asistir a dos asesores a la vez", () => {
  assert.equal(
    slotIsAvailable({ ...slot, advisorId: "ana" }, [booking]),
    false,
  );
});

test("el flujo pendiente, confirmada, realizada habilita una sola reseña válida", () => {
  assert.equal(
    validateBookingUpdate(booking, { status: "Confirmada" }).ok,
    true,
  );
  const confirmed = { ...booking, status: "Confirmada" };
  assert.equal(
    validateBookingUpdate(confirmed, { status: "Realizada" }).ok,
    false,
  );
  assert.equal(
    validateBookingUpdate(
      { ...confirmed, date: "2000-01-01" },
      { status: "Realizada" },
    ).ok,
    true,
  );
  assert.equal(
    validateBookingUpdate(confirmed, { status: "Cancelada" }).ok,
    false,
  );
  assert.equal(
    validateBookingUpdate(confirmed, { reprogramRequested: true }).ok,
    true,
  );
  assert.equal(
    validateBookingUpdate(
      { ...confirmed, reprogramRequested: true },
      { reprogramRequested: true },
    ).ok,
    false,
  );
  const review = { rating: 5, comment: "Muy claro", createdAt: "demo" };
  assert.equal(validateBookingUpdate(booking, { review }).ok, false);
  const done = { ...booking, status: "Realizada" };
  assert.equal(validateBookingUpdate(done, { review }).ok, true);
  assert.equal(
    validateBookingUpdate({ ...done, review }, { review }).ok,
    false,
  );
  assert.equal(
    validateBookingUpdate(done, { review: { ...review, rating: 6 } }).ok,
    false,
  );
  assert.equal(
    validateBookingUpdate(done, { review: { ...review, comment: " " } }).ok,
    false,
  );
});

const confirmedBooking = { ...booking, status: "Confirmada" };
const alternative = { ...slot, id: "s2", date: "2099-06-16" };

test("la reprogramación exige un horario futuro y distinto del mismo asesor", () => {
  assert.equal(
    validateReschedule(confirmedBooking, alternative.id, [alternative], []).ok,
    true,
  );
  assert.equal(
    validateReschedule(confirmedBooking, slot.id, [slot], []).ok,
    false,
  );
  assert.equal(
    validateReschedule(confirmedBooking, "missing", [alternative], []).ok,
    false,
  );
  assert.equal(
    validateReschedule(
      confirmedBooking,
      alternative.id,
      [{ ...alternative, advisorId: "ana" }],
      [],
    ).ok,
    false,
  );
  assert.equal(
    validateReschedule(
      confirmedBooking,
      alternative.id,
      [{ ...alternative, date: "2000-01-01" }],
      [],
    ).ok,
    false,
  );
  assert.equal(
    validateReschedule(booking, alternative.id, [alternative], []).ok,
    false,
  );
});

test("se vuelve a comprobar la disponibilidad cuando el asesor acepta", () => {
  const proposed = {
    ...confirmedBooking,
    reprogramRequested: true,
    reprogramSlotId: alternative.id,
  };
  assert.equal(
    validateReschedule(
      proposed,
      alternative.id,
      [alternative],
      [proposed],
      true,
    ).ok,
    true,
  );
  const busy = {
    ...booking,
    id: "busy",
    date: alternative.date,
    time: "16:30",
  };
  assert.equal(
    validateReschedule(
      proposed,
      alternative.id,
      [alternative],
      [proposed, busy],
      true,
    ).ok,
    false,
  );
  assert.equal(
    validateReschedule(
      confirmedBooking,
      alternative.id,
      [alternative],
      [],
      true,
    ).ok,
    false,
  );
});

test("se permite mover a un horario que solapa solo con la propia reserva", () => {
  assert.equal(
    validateReschedule(
      confirmedBooking,
      "overlap",
      [{ ...slot, id: "overlap", time: "16:15" }],
      [confirmedBooking],
    ).ok,
    true,
  );
});

test("no se puede finalizar antes del fin ni con una reprogramación pendiente", () => {
  const past = { ...confirmedBooking, date: "2000-01-01" };
  assert.equal(sessionHasEnded(past), true);
  assert.equal(sessionHasEnded(confirmedBooking), false);
  const end = new Date(`${slot.date}T16:45:00`).getTime();
  assert.equal(sessionHasEnded(confirmedBooking, end - 1), false);
  assert.equal(sessionHasEnded(confirmedBooking, end), true);
  assert.equal(
    validateBookingUpdate(
      { ...past, reprogramRequested: true },
      { status: "Realizada" },
    ).ok,
    false,
  );
  assert.equal(
    validateBookingUpdate(
      { ...confirmedBooking, reprogramRequested: true },
      { reprogramRequested: false },
    ).ok,
    true,
  );
});

test("se reserva cualquier curso del asesor, pero no un curso ajeno", () => {
  assert.equal(
    validateBooking({ ...data, course: "Álgebra Lineal" }, [slot], []).ok,
    true,
  );
  assert.equal(
    validateBooking({ ...data, course: "Física General I" }, [slot], []).ok,
    false,
  );
});

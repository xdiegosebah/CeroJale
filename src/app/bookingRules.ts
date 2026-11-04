import type { AvailabilitySlot, Booking } from "./App";
import { ADVISORS } from "./advisors.ts";

export type ActionResult = { ok: boolean; message: string };

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isFutureSlot(
  slot: Pick<AvailabilitySlot, "date" | "time">,
  now = Date.now(),
): boolean {
  const start = new Date(`${slot.date}T${slot.time}:00`).getTime();
  return Number.isFinite(start) && start > now;
}

export function overlaps(
  first: { date: string; time: string; duration?: number },
  second: { date: string; time: string; duration?: number },
): boolean {
  if (first.date !== second.date) return false;
  const minutes = (time: string) => {
    const [hours, mins] = time.split(":").map(Number);
    return hours * 60 + mins;
  };
  const start = minutes(first.time);
  const otherStart = minutes(second.time);
  return (
    start < otherStart + (second.duration ?? 45) &&
    otherStart < start + (first.duration ?? 45)
  );
}

export function slotIsAvailable(
  slot: AvailabilitySlot,
  bookings: Booking[],
): boolean {
  if (!isFutureSlot(slot)) return false;
  return !bookings.some(
    (booking) =>
      booking.status !== "Cancelada" &&
      // All reservations belong to the single demo student, who cannot attend
      // simultaneous sessions, even when they are with different advisors.
      overlaps(slot, booking),
  );
}

export function validateBooking(
  booking: Omit<Booking, "id" | "status" | "createdAt">,
  slots: AvailabilitySlot[],
  bookings: Booking[],
): ActionResult {
  const advisor = ADVISORS.find((item) => item.id === booking.advisorId);
  if (!advisor || !advisor.courses.includes(booking.course)) {
    return { ok: false, message: "Selecciona un curso que enseñe el asesor." };
  }
  if (!booking.topic.trim() || booking.topic.trim().length > 240) {
    return {
      ok: false,
      message: "Indica el tema que necesitas reforzar (máximo 240 caracteres).",
    };
  }
  const slot = slots.find(
    (item) =>
      item.advisorId === booking.advisorId &&
      item.date === booking.date &&
      item.time === booking.time &&
      item.modality === booking.modality &&
      item.location === booking.location,
  );
  if (!slot || !isFutureSlot(slot)) {
    return {
      ok: false,
      message:
        "Ese horario ya no está disponible. Selecciona una fecha y hora futuras.",
    };
  }
  if (!slotIsAvailable(slot, bookings)) {
    return {
      ok: false,
      message:
        "Ese horario está ocupado o se cruza con otra de tus asesorías. Elige otro.",
    };
  }
  if (booking.duration !== 45 || booking.price < 25 || booking.price > 35) {
    return {
      ok: false,
      message: "Revisa el precio y la duración de la sesión.",
    };
  }
  return {
    ok: true,
    message:
      "Reserva enviada. El asesor revisará tu solicitud en Mis asesorías.",
  };
}

export function validateNewSlot(
  slot: Omit<AvailabilitySlot, "id" | "advisorId">,
  advisorId: string,
  slots: AvailabilitySlot[],
): ActionResult {
  if (!slot.location.trim() || !isFutureSlot(slot)) {
    return {
      ok: false,
      message: "Completa la ubicación y selecciona una fecha y hora futuras.",
    };
  }
  if (
    slots.some((item) => item.advisorId === advisorId && overlaps(item, slot))
  ) {
    return {
      ok: false,
      message:
        "Ese horario se cruza con otro publicado. Cada sesión dura 45 minutos.",
    };
  }
  return { ok: true, message: "Horario disponible agregado." };
}

export function validateBookingUpdate(
  booking: Booking,
  changes: Partial<Booking>,
): ActionResult {
  if (changes.review) {
    if (booking.status !== "Realizada" || booking.review) {
      return {
        ok: false,
        message: "Solo puedes dejar una reseña por asesoría realizada.",
      };
    }
    const { rating, comment } = changes.review;
    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      !comment.trim() ||
      comment.trim().length > 300
    ) {
      return {
        ok: false,
        message:
          "Selecciona de 1 a 5 estrellas y escribe un comentario (máximo 300 caracteres).",
      };
    }
  }
  if (
    changes.reprogramRequested &&
    (booking.status !== "Confirmada" || booking.reprogramRequested)
  ) {
    return {
      ok: false,
      message:
        "Solo puedes solicitar una reprogramación de una sesión confirmada.",
    };
  }
  if (changes.status === "Realizada" && !sessionHasEnded(booking)) {
    return {
      ok: false,
      message:
        "La sesión solo puede marcarse como realizada después de su hora de finalización.",
    };
  }
  if (changes.status === "Realizada" && booking.reprogramRequested) {
    return {
      ok: false,
      message: "Resuelve primero la solicitud de reprogramación.",
    };
  }
  if (changes.status) {
    const allowed: Record<Booking["status"], Booking["status"][]> = {
      Pendiente: ["Confirmada", "Cancelada"],
      Confirmada: ["Realizada"],
      Realizada: [],
      Cancelada: [],
    };
    if (!allowed[booking.status].includes(changes.status)) {
      return {
        ok: false,
        message: "La reserva ya cambió de estado. Revisa Mis asesorías.",
      };
    }
  }
  return { ok: true, message: "Reserva actualizada." };
}

export function sessionHasEnded(
  booking: Pick<Booking, "date" | "time" | "duration">,
  now = Date.now(),
): boolean {
  const end =
    new Date(`${booking.date}T${booking.time}:00`).getTime() +
    booking.duration * 60_000;
  return Number.isFinite(end) && now >= end;
}

export function validateReschedule(
  booking: Booking,
  slotId: string | undefined,
  slots: AvailabilitySlot[],
  bookings: Booking[],
  accepting = false,
): ActionResult {
  if (
    booking.status !== "Confirmada" ||
    (accepting && !booking.reprogramRequested)
  ) {
    return {
      ok: false,
      message:
        "Solo puedes reprogramar una sesión confirmada con una propuesta pendiente.",
    };
  }
  const target = slots.find(
    (slot) => slot.id === slotId && slot.advisorId === booking.advisorId,
  );
  if (
    !target ||
    !isFutureSlot(target) ||
    (target.date === booking.date && target.time === booking.time)
  ) {
    return {
      ok: false,
      message: "Elige otro horario futuro del mismo asesor.",
    };
  }
  if (
    !slotIsAvailable(
      target,
      bookings.filter((item) => item.id !== booking.id),
    )
  ) {
    return {
      ok: false,
      message:
        "El nuevo horario ya está ocupado o se cruza con otra asesoría. Elige otro.",
    };
  }
  return { ok: true, message: "Horario de reprogramación válido." };
}

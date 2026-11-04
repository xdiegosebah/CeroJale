import { useState } from "react";
import type { AvailabilitySlot, Booking } from "../App";
import { slotIsAvailable } from "../bookingRules";
import { DemoModal } from "./DemoModal";

export function ReschedulePicker({
  booking,
  slots,
  bookings,
  onSubmit,
  onClose,
}: {
  booking: Booking;
  slots: AvailabilitySlot[];
  bookings: Booking[];
  onSubmit: (slotId: string) => { ok: boolean; message: string };
  onClose: () => void;
}) {
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const available = slots
    .filter(
      (slot) =>
        slot.advisorId === booking.advisorId &&
        !(slot.date === booking.date && slot.time === booking.time) &&
        slotIsAvailable(
          slot,
          bookings.filter((item) => item.id !== booking.id),
        ),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <DemoModal title="Elegir nuevo horario" onClose={onClose}>
      <form
        className="space-y-5 p-6 pt-10"
        onSubmit={(event) => {
          event.preventDefault();
          const result = onSubmit(selected);
          if (result.ok) onClose();
          else setError(result.message);
        }}
      >
        <div>
          <h2 className="text-xl font-black text-[#003B71]">
            Elegir nuevo horario
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {booking.course} · {booking.advisorName}
          </p>
        </div>
        <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
          Tu reserva actual se mantiene hasta que el asesor acepte el cambio. El
          horario propuesto no queda bloqueado mientras espera respuesta.
        </p>
        {available.length ? (
          <label className="block text-sm font-semibold text-gray-700">
            Nuevo horario
            <select
              required
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm"
            >
              <option value="">Selecciona una opción</option>
              {available.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {new Date(`${slot.date}T12:00:00`).toLocaleDateString(
                    "es-PE",
                  )}{" "}
                  · {slot.time} · {slot.modality} · {slot.location}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            El asesor no tiene otros horarios disponibles. Puedes volver a
            intentarlo cuando publique más.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-rose-700">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold"
          >
            Volver
          </button>
          <button
            disabled={!selected}
            className="flex-1 rounded-xl bg-[#1E3A8A] py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Enviar propuesta
          </button>
        </div>
      </form>
    </DemoModal>
  );
}

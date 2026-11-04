import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import { ReschedulePicker } from "../ReschedulePicker";
import type { AvailabilitySlot, Booking } from "../../App";
import type { ActionResult } from "../../bookingRules";
import { DemoModal } from "../DemoModal";
import { DemoSessionLink } from "../DemoSessionLink";

const statusStyles = {
  Pendiente: "bg-amber-100 text-amber-800",
  Confirmada: "bg-emerald-100 text-emerald-800",
  Realizada: "bg-blue-100 text-blue-800",
  Cancelada: "bg-gray-100 text-gray-600",
};

export function MyBookingsView({
  bookings,
  slots,
  onUpdate,
}: {
  bookings: Booking[];
  slots: AvailabilitySlot[];
  onUpdate: (id: string, changes: Partial<Booking>) => ActionResult;
}) {
  const [rescheduling, setRescheduling] = useState<Booking | null>(null);
  const [reviewing, setReviewing] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const action = (text: string, callback: () => ActionResult) => {
    const result = callback();
    setMessage(result.ok ? text : result.message);
    window.setTimeout(() => setMessage(""), 4000);
  };

  const sendReview = () => {
    if (!reviewing || rating === 0 || !comment.trim()) {
      setMessage("Selecciona de 1 a 5 estrellas y escribe un comentario.");
      return;
    }
    const result = onUpdate(reviewing.id, {
      review: {
        rating,
        comment: comment.trim(),
        createdAt: new Date().toLocaleDateString("es-PE"),
      },
    });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setReviewing(null);
    setMessage("Gracias. Tu reseña de demostración fue registrada.");
  };

  return (
    <div className="space-y-5">
      {message && (
        <div
          role="status"
          className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800"
        >
          {message}
        </div>
      )}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600">
            Todavía no tienes asesorías reservadas.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Busca un curso y elige el horario que más te convenga.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="truncate text-xs font-semibold text-gray-400"
                    title={booking.id}
                  >
                    {booking.id}
                  </p>
                  <h3 className="mt-1 font-bold text-[#1E3A8A]">
                    {booking.course}
                  </h3>
                  <p className="text-sm text-gray-600">{booking.advisorName}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[booking.status]}`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(`${booking.date}T12:00:00`).toLocaleDateString(
                    "es-PE",
                    { day: "numeric", month: "short" },
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {booking.time} · {booking.duration} min
                </span>
                <span className="col-span-2 flex items-center gap-1.5">
                  <MapPin size={13} />
                  {booking.modality} · {booking.location}
                </span>
              </div>
              <div className="mt-3 rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] font-bold uppercase text-gray-400">
                  Tema de consulta
                </p>
                <p className="mt-1 break-words text-sm text-gray-700">
                  {booking.topic}
                </p>
              </div>
              <p className="mt-3 text-sm font-bold text-[#1E3A8A]">
                Precio total: S/{booking.price}
              </p>
              {booking.modality === "Virtual" &&
                booking.status === "Confirmada" && (
                  <DemoSessionLink booking={booking} />
                )}
              {booking.reprogramNotice && (
                <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs text-blue-800">
                  {booking.reprogramNotice}
                </p>
              )}
              {booking.reprogramRequested && (
                <p className="mt-3 rounded-xl bg-purple-50 p-3 text-xs font-semibold text-purple-700">
                  Reprogramación solicitada al asesor.{" "}
                  {slots.find((slot) => slot.id === booking.reprogramSlotId)
                    ? `${slots.find((slot) => slot.id === booking.reprogramSlotId)!.date} · ${slots.find((slot) => slot.id === booking.reprogramSlotId)!.time}`
                    : "Retira la solicitud y elige un nuevo horario."}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {booking.reprogramRequested && (
                  <button
                    onClick={() =>
                      action(
                        "Solicitud retirada. Se mantiene el horario original.",
                        () =>
                          onUpdate(booking.id, {
                            reprogramRequested: false,
                            reprogramSlotId: undefined,
                          }),
                      )
                    }
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600"
                  >
                    Retirar solicitud
                  </button>
                )}
                {booking.status === "Pendiente" && (
                  <button
                    onClick={() =>
                      action("Reserva pendiente cancelada.", () =>
                        onUpdate(booking.id, { status: "Cancelada" }),
                      )
                    }
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600"
                  >
                    <XCircle size={14} />
                    Cancelar
                  </button>
                )}
                {booking.status === "Confirmada" &&
                  !booking.reprogramRequested && (
                    <button
                      onClick={() => setRescheduling(booking)}
                      className="flex items-center gap-1.5 rounded-xl border border-purple-200 px-3 py-2 text-xs font-bold text-purple-700"
                    >
                      <RotateCcw size={14} />
                      Solicitar reprogramación
                    </button>
                  )}
                {booking.status === "Realizada" && !booking.review && (
                  <button
                    onClick={() => {
                      setReviewing(booking);
                      setRating(0);
                      setComment("");
                      setMessage("");
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-3 py-2 text-xs font-bold text-white"
                  >
                    <Star size={14} />
                    Dejar reseña
                  </button>
                )}
                {booking.review && (
                  <div className="w-full rounded-xl bg-amber-50 p-3">
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <Star size={14} fill="currentColor" />
                      Reseña de demostración enviada · {booking.review.rating}/5
                    </span>
                    <p className="mt-1 break-words text-sm text-gray-600">
                      {booking.review.comment}
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {rescheduling && (
        <ReschedulePicker
          booking={rescheduling}
          slots={slots}
          bookings={bookings}
          onClose={() => setRescheduling(null)}
          onSubmit={(slotId) => {
            const result = onUpdate(rescheduling.id, {
              reprogramRequested: true,
              reprogramSlotId: slotId,
            });
            setMessage(
              result.ok
                ? "Propuesta enviada. El horario original se mantiene hasta que el asesor acepte."
                : result.message,
            );
            return result;
          }}
        />
      )}
      {reviewing && (
        <DemoModal
          title="Califica tu asesoría"
          onClose={() => setReviewing(null)}
        >
          <div className="p-6 pt-10">
            <h2 className="text-lg font-black text-[#003B71]">
              Califica tu asesoría
            </h2>
            <p className="text-sm text-gray-500">
              {reviewing.course} · Datos de demostración
            </p>
            <div className="my-5 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  aria-label={`${value} estrellas`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  className="rounded-lg p-1 focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Star
                    size={30}
                    className={
                      value <= rating ? "text-amber-400" : "text-gray-300"
                    }
                    fill={value <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
            <label className="text-xs font-bold text-gray-700">
              Comentario *
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={300}
                className="mt-2 min-h-24 w-full rounded-xl border border-gray-200 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Cuéntanos cómo fue tu sesión"
              />
            </label>
            {message && (
              <p
                role="alert"
                className="mt-2 text-xs font-semibold text-rose-600"
              >
                {message}
              </p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setReviewing(null)}
                className="rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600"
              >
                Volver
              </button>
              <button
                onClick={sendReview}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-3 text-sm font-bold text-white"
              >
                <MessageSquare size={15} />
                Enviar
              </button>
            </div>
          </div>
        </DemoModal>
      )}
    </div>
  );
}

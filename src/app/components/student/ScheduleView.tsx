import { Calendar, Clock, MapPin } from "lucide-react";
import type { Booking } from "../../App";
import { DemoSessionLink } from "../DemoSessionLink";

export function ScheduleView({ bookings }: { bookings: Booking[] }) {
  const confirmed = bookings.filter((booking) => booking.status === "Confirmada").sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  return (
    <div className="space-y-5">
      <div><h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Calendar size={20} className="text-blue-600" />Calendario de asesorías</h2><p className="mt-1 text-sm text-gray-500">Solo se muestran tus reservas confirmadas.</p></div>
      {confirmed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center"><Calendar size={40} className="mx-auto mb-3 text-gray-300" /><p className="font-semibold text-gray-600">No tienes asesorías confirmadas en el calendario.</p><p className="mt-1 text-sm text-gray-400">Cuando un asesor acepte tu solicitud, aparecerá aquí.</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {confirmed.map((booking) => <article key={booking.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white"><div className="flex bg-[#1E3A8A] p-4 text-white"><div className="min-w-20 text-center"><p className="text-3xl font-black">{new Date(`${booking.date}T12:00:00`).getDate()}</p><p className="text-xs uppercase text-blue-200">{new Date(`${booking.date}T12:00:00`).toLocaleDateString("es-PE", { month: "short" })}</p></div><div className="border-l border-white/20 pl-4"><h3 className="font-bold">{booking.course}</h3><p className="text-sm text-blue-100">{booking.advisorName}</p></div></div><div className="space-y-2 p-4 text-sm text-gray-600"><p className="flex items-center gap-2"><Clock size={15} />{booking.time} · {booking.duration} minutos</p><p className="flex items-center gap-2"><MapPin size={15} />{booking.modality} · {booking.location}</p>{booking.modality === "Virtual" && <DemoSessionLink booking={booking} />}</div></article>)}
        </div>
      )}
    </div>
  );
}

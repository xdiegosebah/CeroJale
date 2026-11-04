import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { Booking } from "../App";
import { DemoModal } from "./DemoModal";

export function DemoSessionLink({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  return <>
    <a
      href={`#demo-session-${booking.id}`}
      onClick={(event) => { event.preventDefault(); setOpen(true); }}
      className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs font-bold text-blue-700 underline decoration-blue-200 underline-offset-4"
    >
      <ExternalLink size={14} className="shrink-0" />Enlace de demostración · Sala virtual CeroJale
    </a>
    {open && <DemoModal title="Sala virtual de demostración" onClose={() => setOpen(false)}>
      <div id={`demo-session-${booking.id}`} className="space-y-4 p-6 pt-10">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Solo demostración</p>
        <h2 className="text-xl font-black text-[#003B71]">Sala virtual CeroJale</h2>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="font-bold text-gray-900">{booking.course}</p>
          <p className="text-sm text-gray-600">{booking.advisorName}</p>
          <p className="mt-2 text-sm text-blue-700">{booking.date} · {booking.time} · {booking.duration} minutos</p>
        </div>
        <p className="text-sm leading-6 text-gray-600">Este enlace muestra una sala ficticia. No se conecta con servicios externos, no inicia una videollamada ni incluye videos.</p>
        <button onClick={() => setOpen(false)} className="w-full rounded-xl bg-[#1E3A8A] py-3 text-sm font-bold text-white">Volver a mis asesorías</button>
      </div>
    </DemoModal>}
  </>;
}

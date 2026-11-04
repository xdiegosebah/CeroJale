import { useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarPlus,
  CheckCircle,
  ChevronRight,
  Clock,
  ClipboardList,
  LogOut,
  MapPin,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { CeroJaleMiniSidebar } from "../CeroJaleLogo";
import type { AvailabilitySlot, Booking } from "../../App";
import {
  localDate,
  sessionHasEnded,
  type ActionResult,
} from "../../bookingRules";
import { AttendanceView } from "./AttendanceView";
import { GradeRegistrationView } from "./GradeRegistrationView";
import { advisorPhotos } from "../../advisorPhotos";

type Tab = "requests" | "availability" | "attendance" | "grades";

interface Props {
  onLogout: () => void;
  bookings: Booking[];
  slots: AvailabilitySlot[];
  activeAdvisorId: string;
  onUpdateBooking: (id: string, changes: Partial<Booking>) => ActionResult;
  onAddSlot: (slot: Omit<AvailabilitySlot, "id" | "advisorId">) => {
    ok: boolean;
    message: string;
  };
  onRemoveSlot: (id: string) => { ok: boolean; message: string };
}

export function TeacherDashboard({
  onLogout,
  bookings,
  slots,
  activeAdvisorId,
  onUpdateBooking,
  onAddSlot,
  onRemoveSlot,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [modality, setModality] = useState<"Virtual" | "Presencial">("Virtual");
  const [location, setLocation] = useState("Sala virtual CeroJale");
  const [selectedSubject, setSelectedSubject] = useState("Cálculo Diferencial");
  const advisorBookings = bookings.filter(
    (booking) => booking.advisorId === activeAdvisorId,
  );
  const advisorSlots = slots
    .filter((slot) => slot.advisorId === activeAdvisorId)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const pending = advisorBookings.filter(
    (booking) => booking.status === "Pendiente",
  ).length;

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 4000);
  };
  const addSlot = (event: React.FormEvent) => {
    event.preventDefault();
    if (!date || !time || !location.trim())
      return notify("Completa la fecha, hora y ubicación.");
    const result = onAddSlot({
      date,
      time,
      modality,
      location: location.trim(),
    });
    notify(result.message);
    if (result.ok) {
      setDate("");
      setTime("");
    }
  };

  const nav = [
    { id: "requests" as Tab, label: "Solicitudes y sesiones", icon: BookOpen },
    {
      id: "availability" as Tab,
      label: "Mi disponibilidad",
      icon: CalendarPlus,
    },
    { id: "attendance" as Tab, label: "Lista y asistencia", icon: Users },
    { id: "grades" as Tab, label: "Registro de notas", icon: ClipboardList },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] md:h-screen md:flex-row md:overflow-hidden">
      <aside className="flex w-full flex-shrink-0 flex-col bg-[#4C1D95] text-white md:w-64">
        <div className="flex items-center justify-between border-b border-white/10 p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-1 shadow">
              <CeroJaleMiniSidebar />
            </div>
            <div>
              <p className="text-sm font-black">
                Cero<span className="text-[#28E87C]">Jale</span>
              </p>
              <p className="text-[11px] text-purple-200">Panel del asesor</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-purple-200 md:hidden">
            <LogOut size={18} />
          </button>
        </div>
        <div className="hidden border-b border-white/10 p-4 md:block">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <img
              src={advisorPhotos.roberto}
              alt="Roberto Martínez"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">Roberto Martínez</p>
              <p className="text-xs text-purple-200">Asesor activo · Demo</p>
            </div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col md:p-4">
          <p className="hidden px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-purple-300 md:block">
            Gestión
          </p>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex min-w-max items-center gap-2 rounded-xl px-3 py-2.5 text-sm md:w-full md:gap-3 md:py-3 ${active ? "bg-white font-semibold text-[#4C1D95]" : "text-purple-100 hover:bg-white/10"}`}
              >
                <Icon size={18} />
                {item.label}
                {item.id === "requests" && pending > 0 && (
                  <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">
                    {pending}
                  </span>
                )}
                {active && pending === 0 && (
                  <ChevronRight size={14} className="ml-auto hidden md:block" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="hidden border-t border-white/10 p-4 md:block">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-purple-200 hover:bg-white/10"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col md:overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6 md:px-8">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {nav.find((item) => item.id === activeTab)?.label}
            </h1>
            <p className="hidden text-sm text-gray-500 sm:block">
              {activeTab === "requests"
                ? "Solo solicitudes dirigidas a Roberto Martínez"
                : activeTab === "availability"
                  ? "Agrega o elimina horarios para tus estudiantes"
                  : "Módulo académico existente · Datos de demostración"}
            </p>
          </div>
          <button
            aria-label="Ver solicitudes dirigidas al asesor"
            onClick={() => setActiveTab("requests")}
            className="relative rounded-xl p-2 text-gray-500"
          >
            <Bell size={20} />
            {pending > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
            )}
          </button>
        </header>
        <div className="flex-1 p-4 sm:p-6 md:overflow-y-auto md:p-8">
          {message && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm font-semibold text-purple-800"
            >
              {message}
            </div>
          )}
          {activeTab === "requests" && (
            <Requests
              slots={advisorSlots}
              bookings={advisorBookings}
              onUpdate={(id, changes, text) => {
                const result = onUpdateBooking(id, changes);
                notify(result.ok ? text : result.message);
              }}
            />
          )}
          {activeTab === "availability" && (
            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
              <form
                onSubmit={addSlot}
                className="h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div>
                  <h2 className="font-bold text-gray-900">Agregar horario</h2>
                  <p className="text-xs text-gray-500">
                    Los estudiantes podrán reservarlo de inmediato.
                  </p>
                </div>
                <label className="block text-xs font-bold text-gray-700">
                  Fecha
                  <input
                    required
                    min={localDate()}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </label>
                <label className="block text-xs font-bold text-gray-700">
                  Hora
                  <input
                    required
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </label>
                <label className="block text-xs font-bold text-gray-700">
                  Modalidad
                  <select
                    value={modality}
                    onChange={(e) => {
                      const value = e.target.value as "Virtual" | "Presencial";
                      setModality(value);
                      setLocation(
                        value === "Virtual"
                          ? "Sala virtual CeroJale"
                          : "Campus La Molina",
                      );
                    }}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-normal outline-none"
                  >
                    <option>Virtual</option>
                    <option>Presencial</option>
                  </select>
                </label>
                <label className="block text-xs font-bold text-gray-700">
                  Ubicación
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </label>
                <button className="w-full rounded-xl bg-[#4C1D95] py-3 text-sm font-bold text-white">
                  Agregar disponibilidad
                </button>
              </form>
              <section>
                <h2 className="mb-3 font-bold text-gray-900">
                  Horarios publicados ({advisorSlots.length})
                </h2>
                {advisorSlots.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-14 text-center text-sm text-gray-500">
                    No has publicado horarios disponibles.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {advisorSlots.map((slot) => {
                      const occupied = advisorBookings.some(
                        (booking) =>
                          booking.date === slot.date &&
                          booking.time === slot.time &&
                          booking.status !== "Cancelada",
                      );
                      return (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4"
                        >
                          <div>
                            <p className="font-bold text-gray-900">
                              {new Date(
                                `${slot.date}T12:00:00`,
                              ).toLocaleDateString("es-PE", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}{" "}
                              · {slot.time}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {slot.modality} · {slot.location}
                            </p>
                            {occupied && (
                              <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                Horario reservado
                              </span>
                            )}
                          </div>
                          <button
                            aria-label="Eliminar horario"
                            disabled={occupied}
                            onClick={() =>
                              notify(onRemoveSlot(slot.id).message)
                            }
                            className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-gray-300"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
          {(activeTab === "attendance" || activeTab === "grades") && (
            <div className="space-y-5">
              <label className="block text-xs font-bold text-gray-700">
                Mis asignaturas
                <select
                  value={selectedSubject}
                  onChange={(event) => setSelectedSubject(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm md:w-auto"
                >
                  <option>Cálculo Diferencial</option>
                  <option>Fundamentos de Programación</option>
                  <option>Álgebra Lineal</option>
                </select>
              </label>
              <div className="overflow-x-auto">
                <div className="min-w-[660px]">
                  {activeTab === "attendance" ? (
                    <AttendanceView
                      key={selectedSubject}
                      subject={selectedSubject}
                    />
                  ) : (
                    <GradeRegistrationView
                      key={selectedSubject}
                      subject={selectedSubject}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Requests({
  bookings,
  slots,
  onUpdate,
}: {
  bookings: Booking[];
  slots: AvailabilitySlot[];
  onUpdate: (id: string, changes: Partial<Booking>, message: string) => void;
}) {
  const ordered = [...bookings].sort(
    (a, b) =>
      ({ Pendiente: 0, Confirmada: 1, Realizada: 2, Cancelada: 3 })[a.status] -
      { Pendiente: 0, Confirmada: 1, Realizada: 2, Cancelada: 3 }[b.status],
  );
  const stats = [
    {
      label: "Pendientes",
      value: bookings.filter((b) => b.status === "Pendiente").length,
      style: "text-amber-600",
    },
    {
      label: "Confirmadas",
      value: bookings.filter((b) => b.status === "Confirmada").length,
      style: "text-emerald-600",
    },
    {
      label: "Realizadas",
      value: bookings.filter((b) => b.status === "Realizada").length,
      style: "text-blue-600",
    },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-4"
          >
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-black ${stat.style}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      {ordered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600">
            No hay solicitudes para este asesor.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Las reservas de otros asesores no se muestran aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordered.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-black text-purple-700">
                    CA
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-900">
                        {booking.studentName}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${booking.status === "Pendiente" ? "bg-amber-100 text-amber-800" : booking.status === "Confirmada" ? "bg-emerald-100 text-emerald-800" : booking.status === "Realizada" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}
                      >
                        {booking.status}
                      </span>
                      {booking.reprogramRequested && (
                        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
                          Solicita reprogramación
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {booking.id} · {booking.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {booking.status === "Pendiente" && (
                    <>
                      <button
                        onClick={() =>
                          onUpdate(
                            booking.id,
                            { status: "Confirmada" },
                            "Solicitud aceptada. Ya aparece en el calendario del estudiante.",
                          )
                        }
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                      >
                        <CheckCircle size={14} />
                        Aceptar
                      </button>
                      <button
                        onClick={() =>
                          onUpdate(
                            booking.id,
                            { status: "Cancelada" },
                            "Solicitud rechazada.",
                          )
                        }
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600"
                      >
                        <XCircle size={14} />
                        Rechazar
                      </button>
                    </>
                  )}
                  {booking.status === "Confirmada" && (
                    <button
                      disabled={
                        !sessionHasEnded(booking) ||
                        !!booking.reprogramRequested
                      }
                      title={
                        !sessionHasEnded(booking)
                          ? "Disponible al finalizar la sesión"
                          : booking.reprogramRequested
                            ? "Resuelve la reprogramación primero"
                            : "Marcar sesión realizada"
                      }
                      onClick={() =>
                        onUpdate(
                          booking.id,
                          { status: "Realizada", reprogramRequested: false },
                          "Sesión marcada como realizada. El estudiante ya puede dejar una reseña.",
                        )
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CheckCircle size={14} />
                      Marcar realizada
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-xs text-gray-600 sm:grid-cols-3">
                <p className="font-bold text-[#1E3A8A] sm:col-span-3">
                  {booking.course}
                </p>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {booking.date} · {booking.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {booking.modality}
                </span>
                <span className="font-bold text-purple-700">
                  S/{booking.price} · {booking.duration} min
                </span>
                <div className="sm:col-span-3">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    Tema de consulta
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{booking.topic}</p>
                </div>
              </div>
              {booking.reprogramRequested &&
                booking.status === "Confirmada" && (
                  <ProposalActions
                    booking={booking}
                    slots={slots}
                    onUpdate={onUpdate}
                  />
                )}
              {booking.review && (
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs">
                  <p className="font-bold text-amber-700">
                    Reseña del estudiante · {"★".repeat(booking.review.rating)}
                  </p>
                  <p className="mt-1 text-gray-600">{booking.review.comment}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ProposalActions({
  booking,
  slots,
  onUpdate,
}: {
  booking: Booking;
  slots: AvailabilitySlot[];
  onUpdate: (id: string, changes: Partial<Booking>, message: string) => void;
}) {
  const target = slots.find((slot) => slot.id === booking.reprogramSlotId);
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
      <p className="text-sm font-bold text-purple-900">
        Propuesta de nuevo horario
      </p>
      <p className="text-sm text-purple-800">
        {target
          ? `${target.date} · ${target.time} · ${target.modality} · ${target.location}`
          : "El horario propuesto ya no está publicado. Rechaza la solicitud para que el estudiante elija otro."}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          disabled={!target}
          onClick={() =>
            target &&
            onUpdate(
              booking.id,
              { date: target.date },
              "Reprogramación aceptada. Calendario actualizado.",
            )
          }
          className="rounded-xl bg-purple-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          Aceptar cambio
        </button>
        <button
          onClick={() =>
            onUpdate(
              booking.id,
              {
                reprogramRequested: false,
                reprogramSlotId: undefined,
                reprogramNotice:
                  "El asesor rechazó la reprogramación. Se mantiene tu horario original; puedes proponer otro.",
              },
              "Cambio rechazado. Se mantiene el horario original.",
            )
          }
          className="rounded-xl border border-purple-300 px-3 py-2 text-xs font-bold text-purple-800"
        >
          Rechazar cambio
        </button>
      </div>
    </div>
  );
}

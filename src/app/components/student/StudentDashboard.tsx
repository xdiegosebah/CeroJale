import { useState } from "react";
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Clock,
  LogOut,
} from "lucide-react";
import { EnrollmentView } from "./EnrollmentView";
import { MyBookingsView } from "./MyBookingsView";
import { ScheduleView } from "./ScheduleView";
import { CeroJaleMiniSidebar } from "../CeroJaleLogo";
import { GradesView } from "./GradesView";
import { DemoModal } from "../DemoModal";
import type { ActionResult } from "../../bookingRules";
import type { AvailabilitySlot, Booking } from "../../App";

type Tab = "search" | "bookings" | "schedule" | "grades";

interface Props {
  onLogout: () => void;
  bookings: Booking[];
  slots: AvailabilitySlot[];
  onBook: (booking: Omit<Booking, "id" | "status" | "createdAt">) => {
    ok: boolean;
    message: string;
  };
  onUpdateBooking: (id: string, changes: Partial<Booking>) => ActionResult;
}

const navItems = [
  {
    id: "search" as Tab,
    icon: BookOpen,
    label: "Buscar asesorías",
    description: "Encuentra apoyo para tus cursos",
  },
  {
    id: "bookings" as Tab,
    icon: CalendarDays,
    label: "Mis asesorías",
    description: "Revisa y gestiona tus reservas",
  },
  {
    id: "schedule" as Tab,
    icon: Clock,
    label: "Calendario",
    description: "Tus próximas sesiones confirmadas",
  },
  {
    id: "grades" as Tab,
    icon: Award,
    label: "Mis calificaciones",
    description: "Módulo académico existente · Datos de demostración",
  },
];

export function StudentDashboard({
  onLogout,
  bookings,
  slots,
  onBook,
  onUpdateBooking,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [helpOpen, setHelpOpen] = useState(false);
  const confirmed = bookings.filter(
    (booking) => booking.status === "Confirmada",
  ).length;
  const pending = bookings.filter(
    (booking) => booking.status === "Pendiente",
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] md:h-screen md:flex-row md:overflow-hidden">
      <aside className="flex w-full flex-shrink-0 flex-col bg-[#1E3A8A] text-white md:w-64">
        <div className="flex items-center justify-between border-b border-white/10 p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-1 shadow-md">
              <CeroJaleMiniSidebar />
            </div>
            <div>
              <p className="text-sm font-black">
                Cero<span className="text-[#28E87C]">Jale</span>
              </p>
              <p className="text-[11px] text-blue-200">Asesorías USIL</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-2 text-blue-200 hover:bg-white/10 md:hidden"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
        <div className="hidden border-b border-white/10 p-4 md:block">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold">
              CA
            </div>
            <div>
              <p className="text-sm font-semibold">Carlos Andrade</p>
              <p className="text-xs text-blue-200">Estudiante · Demo</p>
            </div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col md:p-4">
          <p className="hidden px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-blue-300 md:block">
            Menú principal
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex min-w-max items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition md:w-full md:gap-3 md:py-3 ${active ? "bg-white font-semibold text-[#1E3A8A]" : "text-blue-100 hover:bg-white/10"}`}
              >
                <Icon
                  size={18}
                  className={active ? "text-blue-500" : "text-blue-300"}
                />
                <span>{item.label}</span>
                {active && (
                  <ChevronRight size={14} className="ml-auto hidden md:block" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="hidden border-t border-white/10 p-4 md:block">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-blue-200 hover:bg-white/10"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col md:overflow-hidden">
        <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6 md:px-8">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {navItems.find((item) => item.id === activeTab)?.label}
            </h1>
            <p className="hidden text-sm text-gray-500 sm:block">
              {navItems.find((item) => item.id === activeTab)?.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-[#1E3A8A]"
            >
              <CircleHelp size={17} />
              Ayuda
            </button>
            <button
              aria-label="Ver estado de mis asesorías"
              onClick={() => setActiveTab("bookings")}
              className="relative rounded-xl p-2 text-gray-500"
            >
              <Bell size={20} />
              {confirmed > 0 && (
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </button>
          </div>
        </header>
        {activeTab === "search" && (
          <div className="grid flex-shrink-0 grid-cols-2 gap-3 px-4 pt-4 sm:px-6 md:grid-cols-3 md:px-8 md:pt-6">
            {[
              {
                label: "Reservas pendientes",
                value: pending,
                color: "text-amber-600",
              },
              {
                label: "Sesiones confirmadas",
                value: confirmed,
                color: "text-emerald-600",
              },
              {
                label: "Precio por sesión",
                value: "S/25–35",
                color: "text-blue-600",
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 ${index === 2 ? "col-span-2 md:col-span-1" : ""}`}
              >
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`mt-1 text-xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 p-4 sm:p-6 md:overflow-y-auto md:p-8">
          {activeTab === "search" && (
            <EnrollmentView bookings={bookings} slots={slots} onBook={onBook} />
          )}
          {activeTab === "bookings" && (
            <MyBookingsView
              slots={slots}
              bookings={bookings}
              onUpdate={onUpdateBooking}
            />
          )}
          {activeTab === "schedule" && <ScheduleView bookings={bookings} />}
          {activeTab === "grades" && (
            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <GradesView />
              </div>
            </div>
          )}
        </div>
      </main>

      {helpOpen && (
        <DemoModal title="Centro de ayuda" onClose={() => setHelpOpen(false)}>
          <div className="p-6 pt-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <CircleHelp size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#003B71]">
                  Centro de ayuda
                </h2>
                <p className="text-xs text-gray-500">
                  Preguntas frecuentes · Prototipo
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                {
                  q: "¿Cómo reservo una asesoría?",
                  a: "Busca el curso, elige una fecha y un horario disponibles, indica tu tema y confirma el resumen. La solicitud quedará Pendiente. Puedes reservar el mismo curso en otra fecha.",
                },
                {
                  q: "¿Puedo cancelar una reserva?",
                  a: "Sí. Puedes cancelar desde Mis asesorías mientras la reserva se encuentre Pendiente. El horario quedará libre nuevamente.",
                },
                {
                  q: "¿Cómo solicito una reprogramación?",
                  a: "En una reserva Confirmada, pulsa Solicitar reprogramación. Elige otro horario disponible. El asesor podrá aceptar o rechazar tu propuesta; si acepta, el calendario se actualiza. El horario propuesto no queda bloqueado mientras espera respuesta. La fecha original permanece en el calendario: solicitar un cambio no lo confirma automáticamente. Este prototipo no envía notificaciones externas.",
                },
                {
                  q: "¿Dónde se guardan mis cambios?",
                  a: "Solo en localStorage de este navegador. No hay autenticación real ni sincronización entre dispositivos. Si borras los datos del navegador, se eliminarán las reservas.",
                },
                {
                  q: "¿Se realiza algún cobro?",
                  a: "No. Los precios, perfiles, reseñas y enlaces son datos de demostración; no existe procesamiento de pagos ni una sala de videollamada real.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <summary className="cursor-pointer text-sm font-bold text-gray-800">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </DemoModal>
      )}
    </div>
  );
}

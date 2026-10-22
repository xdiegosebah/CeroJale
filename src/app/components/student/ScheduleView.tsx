import { Fragment } from "react";
import { Clock, MapPin } from "lucide-react";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const hours = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const classes = [
  { subject: "Cálculo Diferencial", day: 0, startHour: 7, duration: 2, room: "Aula 201", color: "bg-[#DBEAFE] border-[#93C5FD] text-[#1D4ED8]" },
  { subject: "Cálculo Diferencial", day: 2, startHour: 7, duration: 2, room: "Aula 201", color: "bg-[#DBEAFE] border-[#93C5FD] text-[#1D4ED8]" },
  { subject: "Fund. de Programación", day: 1, startHour: 9, duration: 2, room: "Lab. 05", color: "bg-[#D1FAE5] border-[#6EE7B7] text-[#065F46]" },
  { subject: "Fund. de Programación", day: 3, startHour: 9, duration: 2, room: "Lab. 05", color: "bg-[#D1FAE5] border-[#6EE7B7] text-[#065F46]" },
  { subject: "Álgebra Lineal", day: 0, startHour: 11, duration: 2, room: "Aula 108", color: "bg-[#EDE9FE] border-[#C4B5FD] text-[#5B21B6]" },
  { subject: "Álgebra Lineal", day: 2, startHour: 11, duration: 2, room: "Aula 108", color: "bg-[#EDE9FE] border-[#C4B5FD] text-[#5B21B6]" },
  { subject: "Inglés Técnico I", day: 4, startHour: 7, duration: 4, room: "Aula 310", color: "bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]" },
  { subject: "Estadística", day: 2, startHour: 9, duration: 2, room: "Aula 215", color: "bg-[#FCE7F3] border-[#F9A8D4] text-[#9D174D]" },
  { subject: "Estadística", day: 4, startHour: 9, duration: 2, room: "Aula 215", color: "bg-[#FCE7F3] border-[#F9A8D4] text-[#9D174D]" },
];

const todayClasses = [
  { time: "07:00 – 09:00", subject: "Cálculo Diferencial", room: "Aula 201", teacher: "Dr. Martínez" },
  { time: "11:00 – 13:00", subject: "Álgebra Lineal", room: "Aula 108", teacher: "Msc. Rodríguez" },
];

export function ScheduleView() {
  const HOUR_HEIGHT = 60;
  const START_HOUR = 7;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Clock size={22} className="text-[#3B82F6]" />
        <h2 className="text-[#111827]">Mi Horario — Período 2026-I</h2>
      </div>

      {/* Today's classes */}
      <div className="mb-6">
        <h3 className="text-[#374151] mb-3 text-sm uppercase tracking-wide" style={{ fontWeight: 600 }}>Clases de Hoy — Lunes 18 de junio</h3>
        <div className="grid grid-cols-2 gap-4">
          {todayClasses.map((c) => (
            <div key={c.subject} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex items-start gap-4">
              <div className="bg-[#EFF6FF] rounded-xl p-3">
                <Clock size={20} className="text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-[#111827]" style={{ fontWeight: 600 }}>{c.subject}</p>
                <p className="text-sm text-[#3B82F6]">{c.time}</p>
                <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mt-1">
                  <MapPin size={12} />
                  {c.room} · {c.teacher}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly calendar grid */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(5, 1fr)" }}>
          {/* Header */}
          <div className="bg-[#F8FAFC] border-b border-r border-[#E5E7EB] py-3" />
          {days.map((d) => (
            <div key={d} className="bg-[#F8FAFC] border-b border-r border-[#E5E7EB] py-3 px-2 text-center text-xs text-[#6B7280] uppercase tracking-wide last:border-r-0" style={{ fontWeight: 600 }}>{d}</div>
          ))}

          {/* Time rows */}
          {hours.map((hour, hIdx) => (
            <Fragment key={`h-row-${hour}`}>
              <div key={`h-${hour}`} className="border-b border-r border-[#F3F4F6] py-2 px-2 text-right text-xs text-[#9CA3AF]">{hour}</div>
              {days.map((_, dIdx) => {
                const cellClasses = classes.filter((c) => c.day === dIdx && c.startHour === parseInt(hour));
                return (
                  <div key={`cell-${hIdx}-${dIdx}`} className="border-b border-r border-[#F3F4F6] last:border-r-0 relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                    {cellClasses.map((cls) => (
                      <div
                        key={cls.subject + cls.day + cls.startHour}
                        className={`absolute inset-x-1 top-1 rounded-lg border ${cls.color} p-2 z-10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group`}
                        style={{ height: `${cls.duration * HOUR_HEIGHT - 8}px` }}
                      >
                        <div>
                          <p className="text-xs leading-tight truncate font-semibold tracking-tight">{cls.subject}</p>
                          <p className="text-[11px] opacity-80 flex items-center gap-1 mt-1 font-medium">
                            <MapPin size={11} className="shrink-0 opacity-70" />
                            <span className="truncate">{cls.room}</span>
                          </p>
                        </div>
                        {cls.duration > 1 && (
                          <div className="flex items-center justify-between text-[10px] opacity-60 mt-auto pt-1 border-t border-current/10 font-mono">
                            <span>{cls.duration}h</span>
                            <span>{`${cls.startHour < 10 ? '0' : ''}${cls.startHour}:00 - ${cls.startHour + cls.duration < 10 ? '0' : ''}${cls.startHour + cls.duration}:00`}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

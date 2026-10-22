import { useState } from "react";
import { BookOpen, CreditCard, X, CheckCircle, MapPin, Clock, Calendar, User } from "lucide-react";
import type { EnrollmentRequest } from "../../App";

interface Subject {
  id: number;
  name: string;
  credits: number;
  spots: number;
  cost: number;
  teacher: { name: string; title: string; photo: string };
}

const SUBJECTS: Subject[] = [
  {
    id: 1, name: "Cálculo Diferencial", credits: 4, spots: 15, cost: 280,
    teacher: { name: "Dr. Roberto Martínez", title: "Ing. Matemáticas", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format" },
  },
  {
    id: 2, name: "Fundamentos de Programación", credits: 3, spots: 8, cost: 210,
    teacher: { name: "Ing. Ana Flores", title: "Ciencias de la Computación", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format" },
  },
  {
    id: 3, name: "Álgebra Lineal", credits: 4, spots: 22, cost: 280,
    teacher: { name: "Dr. Carlos Mendoza", title: "Ing. Matemáticas", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format" },
  },
  {
    id: 4, name: "Física General I", credits: 4, spots: 3, cost: 280,
    teacher: { name: "Msc. Diana Torres", title: "Física Aplicada", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&auto=format" },
  },
  {
    id: 5, name: "Inglés Técnico I", credits: 2, spots: 18, cost: 140,
    teacher: { name: "Prof. Sarah Johnson", title: "Lingüística Aplicada", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&auto=format" },
  },
  {
    id: 6, name: "Introducción a la Ingeniería", credits: 2, spots: 30, cost: 140,
    teacher: { name: "Ing. Miguel Rojas", title: "Ing. Industrial", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&auto=format" },
  },
  {
    id: 7, name: "Estadística Descriptiva", credits: 3, spots: 11, cost: 210,
    teacher: { name: "Dra. Patricia Vega", title: "Estadística y Probabilidad", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&auto=format" },
  },
  {
    id: 8, name: "Química General", credits: 4, spots: 0, cost: 280,
    teacher: { name: "Dr. Luis Castillo", title: "Química Industrial", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format" },
  },
];

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const TIMES = ["07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const CAMPUSES = ["Campus La Molina", "Campus San Isidro", "Campus Miraflores", "Virtual MS Teams"];

interface EnrollmentConfig {
  day: string;
  time: string;
  campus: string;
}

interface CartItem {
  subject: Subject;
  config: EnrollmentConfig;
}

interface EnrollmentViewProps {
  onEnroll: (req: Omit<EnrollmentRequest, "id" | "status" | "createdAt">) => void;
  enrollmentRequests: EnrollmentRequest[];
}

export function EnrollmentView({ onEnroll, enrollmentRequests }: EnrollmentViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalSubject, setModalSubject] = useState<Subject | null>(null);
  const [config, setConfig] = useState<EnrollmentConfig>({ day: "Lunes", time: "09:00", campus: "Virtual MS Teams" });
  const [ordered, setOrdered] = useState(false);

  const inCart = (id: number) => cart.some((c) => c.subject.id === id);
  const alreadyEnrolled = (id: number) => enrollmentRequests.some((r) => r.subjectId === id);

  const openModal = (subject: Subject) => {
    if (subject.spots === 0 || inCart(subject.id) || alreadyEnrolled(subject.id)) return;
    setModalSubject(subject);
    setConfig({ day: "Lunes", time: "09:00", campus: "Virtual MS Teams" });
  };

  const confirmAdd = () => {
    if (!modalSubject) return;
    setCart((prev) => [...prev, { subject: modalSubject, config }]);
    setModalSubject(null);
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((c) => c.subject.id !== id));

  const totalCredits = cart.reduce((s, c) => s + c.subject.credits, 0);
  const totalCost = cart.reduce((s, c) => s + c.subject.cost, 0);

  const handleOrder = () => {
    cart.forEach((item) => {
      onEnroll({
        studentName: "Carlos Andrade",
        subjectId: item.subject.id,
        subjectName: item.subject.name,
        teacher: item.subject.teacher.name,
        credits: item.subject.credits,
        day: item.config.day,
        time: item.config.time,
        campus: item.config.campus,
        cost: item.subject.cost,
      });
    });
    setCart([]);
    setOrdered(true);
  };

  if (ordered) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="bg-[#F0FDF4] rounded-2xl p-10 text-center max-w-md">
          <CheckCircle size={64} className="text-[#10B981] mx-auto mb-4" />
          <h2 className="text-[#065F46] mb-2">¡Solicitud enviada al docente!</h2>
          <p className="text-sm text-[#6B7280] mb-1">Tu matrícula está pendiente de aprobación docente.</p>
          <p className="text-[#6B7280] mb-6 text-sm">Orden N° <span className="text-[#111827] font-semibold">ORD-2026-{String(Math.floor(Math.random() * 90000) + 10000)}</span></p>
          <button onClick={() => setOrdered(false)} className="bg-[#1E40AF] text-white px-6 py-2.5 rounded-xl hover:bg-[#1E3A8A] transition-colors text-sm font-semibold">
            Nueva matrícula
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Subjects table */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-5">
          <BookOpen size={20} className="text-[#3B82F6]" />
          <h2 className="text-[#111827] text-lg font-semibold">Asignaturas Disponibles — 2026-I</h2>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                {["Docente", "Asignatura", "Créditos", "Cupos", "Estado", "Acción"].map((h) => (
                  <th key={h} className="text-left py-3.5 px-4 text-xs text-[#6B7280] uppercase tracking-wide font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map((subject, idx) => {
                const full = subject.spots === 0;
                const cartItem = inCart(subject.id);
                const enrolled = alreadyEnrolled(subject.id);
                const disabled = full || cartItem || enrolled;
                return (
                  <tr
                    key={subject.id}
                    className={`border-b border-[#F3F4F6] transition-colors ${disabled ? "opacity-60" : "cursor-pointer hover:bg-[#EFF6FF]"} ${cartItem ? "bg-[#EFF6FF]" : idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}
                    onClick={() => !disabled && openModal(subject)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={subject.teacher.photo}
                          alt={subject.teacher.name}
                          className="w-9 h-9 rounded-full object-cover border-2 border-[#BFDBFE] flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(subject.teacher.name)}&background=1E3A8A&color=fff&size=80`; }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#111827] truncate">{subject.teacher.name}</p>
                          <p className="text-[11px] text-[#9CA3AF] truncate">{subject.teacher.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-sm font-medium ${cartItem ? "text-[#1D4ED8]" : "text-[#111827]"}`}>{subject.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#3B82F6] text-xs font-semibold">{subject.credits} cr.</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-sm font-medium ${full ? "text-[#EF4444]" : subject.spots <= 5 ? "text-[#F59E0B]" : "text-[#10B981]"}`}>
                        {full ? "Sin cupos" : `${subject.spots} disp.`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {enrolled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold"><CheckCircle size={11} /> Solicitada</span>
                      ) : cartItem ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">En carrito</span>
                      ) : full ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">Lleno</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">Disponible</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {!disabled && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal(subject); }}
                          className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E40AF] transition-colors"
                        >
                          Matricularme
                        </button>
                      )}
                      {cartItem && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromCart(subject.id); }}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          Quitar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cart / summary */}
      <div className="w-72 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sticky top-0">
          <h3 className="text-[#111827] font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={17} className="text-[#3B82F6]" />
            Resumen de Matrícula
          </h3>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
                <BookOpen size={20} className="text-[#9CA3AF]" />
              </div>
              <p className="text-sm text-[#9CA3AF]">Haz clic en "Matricularme" para agregar materias</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
              {cart.map(({ subject, config: cfg }) => (
                <div key={subject.id} className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E5E7EB]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-[#111827] font-medium leading-tight">{subject.name}</p>
                    <button onClick={() => removeFromCart(subject.id)} className="text-[#9CA3AF] hover:text-[#EF4444] flex-shrink-0">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                      <Calendar size={11} /> {cfg.day}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                      <Clock size={11} /> {cfg.time} hrs
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                      <MapPin size={11} /> {cfg.campus}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#9CA3AF]">{subject.credits} créditos</span>
                    <span className="text-sm font-bold text-[#1E40AF]">S/ {subject.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[#F3F4F6] pt-4 space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Total créditos</span>
              <span className="text-[#111827] font-semibold">{totalCredits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280] text-sm">Costo total</span>
              <span className="text-[#1E40AF] font-bold text-lg">S/ {totalCost}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleOrder}
            className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-all ${cart.length === 0 ? "bg-[#D1D5DB] cursor-not-allowed" : "bg-[#1E40AF] hover:bg-[#1E3A8A]"}`}
          >
            Enviar solicitud al docente
          </button>
        </div>
      </div>

      {/* Enrollment modal */}
      {modalSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] p-6 text-white relative">
              <button
                onClick={() => setModalSubject(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              >
                <X size={15} />
              </button>
              <h3 className="font-bold text-lg">Seleccionar Horario</h3>
              <p className="text-xs text-blue-200 mt-0.5">Configura tu matrícula</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Subject + teacher info */}
              <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-2xl p-4 border border-[#E5E7EB]">
                <img
                  src={modalSubject.teacher.photo}
                  alt={modalSubject.teacher.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#BFDBFE] flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(modalSubject.teacher.name)}&background=1E3A8A&color=fff&size=80`; }}
                />
                <div>
                  <p className="text-sm font-bold text-[#1E3A8A]">{modalSubject.name}</p>
                  <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <User size={11} /> {modalSubject.teacher.name}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">{modalSubject.credits} créditos · S/ {modalSubject.cost}</p>
                </div>
              </div>

              {/* Day selector */}
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wide mb-2">
                  <Calendar size={12} className="inline mr-1" />Día de clase
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, day: d }))}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${config.day === d ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#93C5FD]"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time selector */}
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wide mb-2">
                  <Clock size={12} className="inline mr-1" />Hora de inicio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, time: t }))}
                      className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${config.time === t ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#93C5FD]"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campus selector */}
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wide mb-2">
                  <MapPin size={12} className="inline mr-1" />Modalidad / Campus
                </label>
                <div className="space-y-2">
                  {CAMPUSES.map((campus) => (
                    <button
                      key={campus}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, campus }))}
                      className={`w-full text-left py-2.5 px-4 rounded-xl text-sm border-2 transition-all font-medium ${config.campus === campus ? "bg-[#EFF6FF] border-[#3B82F6] text-[#1D4ED8]" : "bg-white border-[#E5E7EB] text-[#374151] hover:border-[#93C5FD]"}`}
                    >
                      {campus.startsWith("Virtual") ? "🖥️" : "🏛️"} {campus}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm */}
              <button
                onClick={confirmAdd}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white font-bold text-sm shadow-md hover:opacity-90 transition-all mt-1"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

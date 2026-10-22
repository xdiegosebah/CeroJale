import { useState } from "react";
import { Users, ClipboardList, GraduationCap, LogOut, Bell, ChevronRight, CheckCircle, XCircle, Clock, MapPin, Calendar, BookOpen } from "lucide-react";
import { AttendanceView } from "./AttendanceView";
import { GradeRegistrationView } from "./GradeRegistrationView";
import { CeroJaleMiniSidebar } from "../CeroJaleLogo";
import type { EnrollmentRequest } from "../../App";

type Tab = "attendance" | "grades" | "enrollments";

interface TeacherDashboardProps {
  onLogout: () => void;
  enrollmentRequests: EnrollmentRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const subjects = [
  { id: "calc", name: "Cálculo Diferencial", code: "MAT-101", group: "A", students: 12 },
  { id: "prog", name: "Fund. de Programación", code: "ING-201", group: "B", students: 10 },
  { id: "alg", name: "Álgebra Lineal", code: "MAT-202", group: "C", students: 12 },
];

export function TeacherDashboard({ onLogout, enrollmentRequests, onApprove, onReject }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("enrollments");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);

  const pendingCount = enrollmentRequests.filter((r) => r.status === "Pendiente").length;

  const navItems: { id: Tab; icon: typeof Users; label: string }[] = [
    { id: "enrollments", icon: BookOpen, label: "Solicitudes de Matrícula" },
    { id: "attendance", icon: Users, label: "Lista y Asistencia" },
    { id: "grades", icon: ClipboardList, label: "Registro de Notas" },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-[#4C1D95] text-white">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1 shadow-md flex-shrink-0">
              <CeroJaleMiniSidebar />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white">Cero</span>
                <span className="text-sm font-bold" style={{ color: "#28E87C" }}>Jale</span>
              </div>
              <div className="text-[11px] text-purple-200">Módulo Docente</div>
            </div>
          </div>
        </div>

        {/* Teacher info */}
        <div className="p-4 border-b border-white/10">
          <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format"
              alt="Roberto Martínez"
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-300 flex-shrink-0"
            />
            <div>
              <p className="text-sm font-semibold">Roberto Martínez</p>
              <p className="text-xs text-purple-200">Prof. Ing. Informática</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs text-purple-300 uppercase tracking-wider mb-3 px-2 font-semibold">Herramientas</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left relative ${isActive ? "bg-white text-[#4C1D95]" : "text-purple-100 hover:bg-white/10"}`}
              >
                <Icon size={18} className={isActive ? "text-[#8B5CF6]" : "text-purple-300"} />
                <span className={`text-sm flex-1 ${isActive ? "font-semibold" : ""}`}>{item.label}</span>
                {item.id === "enrollments" && pendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {pendingCount}
                  </span>
                )}
                {isActive && !pendingCount && <ChevronRight size={14} className="text-[#8B5CF6]" />}
              </button>
            );
          })}

          <div className="pt-4">
            <p className="text-xs text-purple-300 uppercase tracking-wider mb-3 px-2 font-semibold">Mis Asignaturas</p>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s)}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all text-left ${selectedSubject.id === s.id ? "bg-white/20" : "hover:bg-white/10"}`}
              >
                <div className="w-2 h-2 rounded-full bg-purple-300 mt-1.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white truncate">{s.name}</p>
                  <p className="text-xs text-purple-300">{s.code} · Gr. {s.group} · {s.students} est.</p>
                </div>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-purple-200 hover:bg-white/10 transition-all">
            <LogOut size={18} />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-[#111827] font-semibold text-lg">
              {activeTab === "enrollments" ? "Solicitudes de Matrícula" : activeTab === "attendance" ? "Lista y Asistencia" : "Registro de Calificaciones"}
            </h1>
            <p className="text-sm text-[#6B7280]">
              {activeTab === "enrollments" ? "Aprueba y gestiona las solicitudes de tus estudiantes" : `${selectedSubject.name} · ${selectedSubject.code} · Grupo ${selectedSubject.group}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {activeTab !== "enrollments" && (
              <div className="flex bg-[#F3F4F6] rounded-xl p-1">
                <button
                  onClick={() => setActiveTab("attendance")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === "attendance" ? "bg-white text-[#4C1D95] shadow-sm font-semibold" : "text-[#6B7280] hover:text-[#374151]"}`}
                >
                  <Users size={15} /> Asistencia
                </button>
                <button
                  onClick={() => setActiveTab("grades")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === "grades" ? "bg-white text-[#4C1D95] shadow-sm font-semibold" : "text-[#6B7280] hover:text-[#374151]"}`}
                >
                  <ClipboardList size={15} /> Calificaciones
                </button>
              </div>
            )}
            <button className="relative p-2 rounded-xl hover:bg-[#F3F4F6] transition-colors">
              <Bell size={20} className="text-[#6B7280]" />
              {pendingCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "attendance" && <AttendanceView subject={selectedSubject.name} />}
          {activeTab === "grades" && <GradeRegistrationView subject={selectedSubject.name} />}
          {activeTab === "enrollments" && (
            <EnrollmentRequestsView
              requests={enrollmentRequests}
              onApprove={onApprove}
              onReject={onReject}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EnrollmentRequestsView({
  requests,
  onApprove,
  onReject,
}: {
  requests: EnrollmentRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const pending = requests.filter((r) => r.status === "Pendiente");
  const resolved = requests.filter((r) => r.status !== "Pendiente");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total solicitudes", value: requests.length, color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
          { label: "Pendientes", value: pending.length, color: "text-[#F59E0B]", bg: "bg-[#FFFBEB]" },
          { label: "Aprobadas", value: requests.filter((r) => r.status === "Aprobado").length, color: "text-[#10B981]", bg: "bg-[#F0FDF4]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
            <p className="text-xs text-[#6B7280]">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Clock size={17} className="text-[#F59E0B]" />
            <h3 className="font-semibold text-[#111827]">Pendientes de aprobación</h3>
            <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">{pending.length}</span>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {pending.map((req) => (
              <RequestRow key={req.id} req={req} onApprove={onApprove} onReject={onReject} />
            ))}
          </div>
        </div>
      )}

      {/* Empty pending */}
      {pending.length === 0 && requests.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 text-center">
          <BookOpen size={40} className="text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#9CA3AF] font-medium">No hay solicitudes de matrícula aún.</p>
          <p className="text-xs text-[#D1D5DB] mt-1">Cuando un estudiante envíe una solicitud, aparecerá aquí.</p>
        </div>
      )}
      {pending.length === 0 && requests.length > 0 && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 flex items-center gap-3">
          <CheckCircle size={20} className="text-[#10B981]" />
          <p className="text-sm text-[#065F46] font-medium">Todas las solicitudes han sido gestionadas.</p>
        </div>
      )}

      {/* Resolved requests */}
      {resolved.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <CheckCircle size={17} className="text-[#10B981]" />
            <h3 className="font-semibold text-[#111827]">Historial gestionado</h3>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {resolved.map((req) => (
              <RequestRow key={req.id} req={req} onApprove={onApprove} onReject={onReject} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestRow({
  req,
  onApprove,
  onReject,
}: {
  req: EnrollmentRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="p-5 flex items-start gap-4 hover:bg-[#FAFAFA] transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {req.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="font-semibold text-[#111827] text-sm">{req.studentName}</p>
            <p className="text-xs text-[#6B7280]">{req.id} · {req.createdAt}</p>
          </div>
          {req.status === "Pendiente" ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onApprove(req.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <CheckCircle size={13} /> Aprobar
              </button>
              <button
                onClick={() => onReject(req.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-all"
              >
                <XCircle size={13} /> Rechazar
              </button>
            </div>
          ) : (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${req.status === "Aprobado" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
              {req.status === "Aprobado" ? <CheckCircle size={11} /> : <XCircle size={11} />}
              {req.status}
            </span>
          )}
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E5E7EB]">
          <p className="text-sm font-semibold text-[#1E3A8A] mb-2">{req.subjectName}</p>
          <div className="flex flex-wrap gap-3 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1"><Calendar size={11} /> {req.day}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {req.time} hrs</span>
            <span className="flex items-center gap-1"><MapPin size={11} /> {req.campus}</span>
            <span className="flex items-center gap-1 text-[#3B82F6] font-semibold">S/ {req.cost} · {req.credits} cr.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

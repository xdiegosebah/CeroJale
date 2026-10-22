import { useState } from "react";
import { BookOpen, Award, Clock, LogOut, Bell, ChevronRight, TrendingUp, Users, BookMarked } from "lucide-react";
import { EnrollmentView } from "./EnrollmentView";
import { GradesView } from "./GradesView";
import { ScheduleView } from "./ScheduleView";
import { CeroJaleMiniSidebar } from "../CeroJaleLogo";
import type { EnrollmentRequest } from "../../App";

type Tab = "enrollment" | "grades" | "schedule";

interface StudentDashboardProps {
  onLogout: () => void;
  onEnroll: (req: Omit<EnrollmentRequest, "id" | "status" | "createdAt">) => void;
  enrollmentRequests: EnrollmentRequest[];
}

const navItems = [
  { id: "enrollment" as Tab, icon: BookOpen, label: "Matrícula", description: "Selección de asignaturas" },
  { id: "grades" as Tab, icon: Award, label: "Mis Calificaciones", description: "Notas del período actual" },
  { id: "schedule" as Tab, icon: Clock, label: "Horario", description: "Cronograma semanal" },
];

export function StudentDashboard({ onLogout, onEnroll, enrollmentRequests }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("enrollment");

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col bg-[#1E3A8A] text-white">
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
              <div className="text-[11px] text-blue-200">Sistema Académico</div>
            </div>
          </div>
        </div>

        {/* Student info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
              CA
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Carlos Andrade</p>
              <p className="text-xs text-blue-200">Ing. Informática · 5to sem.</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs text-blue-300 uppercase tracking-wider mb-3 px-2 font-semibold">Menú Principal</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${isActive ? "bg-white text-[#1E3A8A]" : "text-blue-100 hover:bg-white/10"}`}
              >
                <Icon size={18} className={isActive ? "text-[#3B82F6]" : "text-blue-300 group-hover:text-white"} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${isActive ? "font-semibold" : ""}`}>{item.label}</div>
                </div>
                {isActive && <ChevronRight size={14} className="text-[#3B82F6]" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition-all">
            <LogOut size={18} />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-[#111827] font-semibold text-lg">{navItems.find((n) => n.id === activeTab)?.label}</h1>
            <p className="text-sm text-[#6B7280]">{navItems.find((n) => n.id === activeTab)?.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-[#F3F4F6] transition-colors">
              <Bell size={20} className="text-[#6B7280]" />
              {enrollmentRequests.some((r) => r.status === "Aprobado") && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10B981]" />
              )}
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
              CA
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        {activeTab === "enrollment" && (
          <div className="px-8 pt-6 grid grid-cols-3 gap-4 flex-shrink-0">
            {[
              { icon: TrendingUp, label: "Promedio Actual", value: "7.93", color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
              { icon: BookMarked, label: "Solicitudes Enviadas", value: String(enrollmentRequests.length), color: "text-[#10B981]", bg: "bg-[#F0FDF4]" },
              { icon: Users, label: "Período Actual", value: "2026-I", color: "text-[#8B5CF6]", bg: "bg-[#F5F3FF]" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-4">
                  <div className={`${stat.bg} rounded-xl p-2.5`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280]">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "enrollment" && <EnrollmentView onEnroll={onEnroll} enrollmentRequests={enrollmentRequests} />}
          {activeTab === "grades" && <GradesView />}
          {activeTab === "schedule" && <ScheduleView />}
        </div>
      </div>
    </div>
  );
}

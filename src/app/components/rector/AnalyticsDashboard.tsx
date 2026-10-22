import { useState } from "react";
import { GraduationCap, LogOut, TrendingUp, Users, BookOpen, Award, Bell } from "lucide-react";

interface AnalyticsDashboardProps {
  onLogout: () => void;
}

export function AnalyticsDashboard({ onLogout }: AnalyticsDashboardProps) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <div className="w-64 flex-shrink-0 flex flex-col bg-[#0F172A] text-white">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-2">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-sm font-bold">Futuro Digital</div>
              <div className="text-xs text-slate-400">Rectoría & Analítica</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10 text-white text-left font-medium">
            <TrendingUp size={18} className="text-blue-400" />
            <span className="text-sm">Panel Académico</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-white/10 transition-all">
            <LogOut size={18} />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-[#111827] text-xl font-bold">Analítica Institucional</h1>
            <p className="text-sm text-[#6B7280]">Indicadores generales de rendimiento — Período 2026-I</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-[#F3F4F6] transition-colors">
              <Bell size={20} className="text-[#6B7280]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { icon: Users, label: "Estudiantes Activos", value: "3,420", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: BookOpen, label: "Cursos Dictados", value: "128", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Award, label: "Promedio General", value: "8.4", color: "text-purple-600", bg: "bg-purple-50" },
              { icon: TrendingUp, label: "Tasa de Retención", value: "94.2%", color: "text-amber-600", bg: "bg-amber-50" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                  <div className={`${stat.bg} rounded-xl w-10 h-10 flex items-center justify-center mb-3`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                  <p className="text-xs text-[#6B7280] mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import { TrendingUp, Award, AlertCircle } from "lucide-react";

const grades = [
  { subject: "Cálculo Diferencial", p1: 7.8, p2: 8.2, final: 8.0, status: "Aprobado" },
  { subject: "Fundamentos de Programación", p1: 9.1, p2: 9.4, final: 9.8, status: "Aprobado" },
  { subject: "Álgebra Lineal", p1: 6.5, p2: 7.0, final: 6.8, status: "Aprobado" },
  { subject: "Física General I", p1: 5.2, p2: 5.8, final: 4.5, status: "Reprobado" },
  { subject: "Inglés Técnico I", p1: 8.9, p2: 9.0, final: 9.2, status: "Aprobado" },
  { subject: "Estadística Descriptiva", p1: 7.5, p2: 7.8, final: 8.1, status: "Aprobado" },
];

function avg(p1: number, p2: number, final: number) {
  return ((p1 * 0.3) + (p2 * 0.3) + (final * 0.4));
}

export function GradesView() {
  const overallAvg = grades.reduce((sum, g) => sum + avg(g.p1, g.p2, g.final), 0) / grades.length;
  const approved = grades.filter((g) => g.status === "Aprobado").length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Award size={22} className="text-[#3B82F6]" />
        <h2 className="text-[#111827]">Mis Calificaciones — Período 2026-I</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Promedio General</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl text-[#1E40AF]" style={{ fontWeight: 700 }}>{overallAvg.toFixed(1)}</span>
            <span className="text-[#9CA3AF] mb-1">/10</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[#E5E7EB]">
            <div className="h-2 rounded-full bg-[#3B82F6]" style={{ width: `${overallAvg * 10}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Materias Aprobadas</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl text-[#10B981]" style={{ fontWeight: 700 }}>{approved}</span>
            <span className="text-[#9CA3AF] mb-1">/ {grades.length}</span>
          </div>
          <div className="mt-3 flex gap-1">
            {grades.map((g, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${g.status === "Aprobado" ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">Créditos Acumulados</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl text-[#8B5CF6]" style={{ fontWeight: 700 }}>87</span>
            <span className="text-[#9CA3AF] mb-1">/ 200</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[#E5E7EB]">
            <div className="h-2 rounded-full bg-[#8B5CF6]" style={{ width: "43.5%" }} />
          </div>
        </div>
      </div>

      {/* Grades table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              {["Materia", "P. Parcial 1", "P. Parcial 2", "Examen Final", "Promedio", "Estado"].map((h) => (
                <th key={h} className="text-left py-4 px-5 text-xs text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.map((g, idx) => {
              const average = avg(g.p1, g.p2, g.final);
              const isPass = g.status === "Aprobado";
              return (
                <tr key={g.subject} className={`border-b border-[#F3F4F6] ${idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                  <td className="py-4 px-5 text-sm text-[#111827]" style={{ fontWeight: 500 }}>{g.subject}</td>
                  <td className="py-4 px-5">
                    <GradeCell value={g.p1} />
                  </td>
                  <td className="py-4 px-5">
                    <GradeCell value={g.p2} />
                  </td>
                  <td className="py-4 px-5">
                    <GradeCell value={g.final} />
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-sm ${average >= 7 ? "text-[#10B981]" : "text-[#EF4444]"}`} style={{ fontWeight: 700 }}>
                      {average.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${isPass ? "bg-[#F0FDF4] text-[#10B981]" : "bg-[#FEF2F2] text-[#EF4444]"}`} style={{ fontWeight: 600 }}>
                      {isPass ? <TrendingUp size={12} /> : <AlertCircle size={12} />}
                      {g.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GradeCell({ value }: { value: number }) {
  const color = value >= 8 ? "text-[#10B981]" : value >= 7 ? "text-[#F59E0B]" : "text-[#EF4444]";
  return <span className={`text-sm ${color}`} style={{ fontWeight: 500 }}>{value.toFixed(1)}</span>;
}

import { useState } from "react";
import { Save, CheckCircle, Lock } from "lucide-react";

interface GradeRegistrationViewProps {
  subject: string;
}

const initialStudents = [
  { id: 1, name: "Carlos Andrade", initials: "CA", color: "from-blue-400 to-blue-600", p1: "8.5", p2: "7.8", final: "9.0" },
  { id: 2, name: "María Sánchez", initials: "MS", color: "from-pink-400 to-pink-600", p1: "9.2", p2: "9.5", final: "9.8" },
  { id: 3, name: "José Ramírez", initials: "JR", color: "from-green-400 to-green-600", p1: "6.0", p2: "6.5", final: "5.8" },
  { id: 4, name: "Ana López", initials: "AL", color: "from-purple-400 to-purple-600", p1: "7.5", p2: "8.0", final: "8.2" },
  { id: 5, name: "Pedro Gómez", initials: "PG", color: "from-orange-400 to-orange-600", p1: "5.0", p2: "5.5", final: "4.8" },
  { id: 6, name: "Lucía Torres", initials: "LT", color: "from-teal-400 to-teal-600", p1: "9.0", p2: "8.8", final: "9.5" },
  { id: 7, name: "Miguel Herrera", initials: "MH", color: "from-red-400 to-red-600", p1: "7.0", p2: "7.2", final: "7.5" },
  { id: 8, name: "Sofía Vargas", initials: "SV", color: "from-yellow-400 to-yellow-600", p1: "8.8", p2: "9.1", final: "9.3" },
  { id: 9, name: "Diego Mora", initials: "DM", color: "from-indigo-400 to-indigo-600", p1: "6.5", p2: "7.0", final: "6.8" },
  { id: 10, name: "Valentina Cruz", initials: "VC", color: "from-rose-400 to-rose-600", p1: "8.0", p2: "8.5", final: "8.7" },
];

function calcAverage(p1: string, p2: string, final: string): string {
  const n1 = parseFloat(p1) || 0;
  const n2 = parseFloat(p2) || 0;
  const nf = parseFloat(final) || 0;
  return (n1 * 0.3 + n2 * 0.3 + nf * 0.4).toFixed(2);
}

function gradeColor(val: string) {
  const n = parseFloat(val);
  if (n >= 8) return "text-[#10B981]";
  if (n >= 7) return "text-[#F59E0B]";
  return "text-[#EF4444]";
}

export function GradeRegistrationView({ subject }: GradeRegistrationViewProps) {
  const [students, setStudents] = useState(initialStudents);
  const [saved, setSaved] = useState(false);

  const updateGrade = (id: number, field: "p1" | "p2" | "final", value: string) => {
    if (/^(\d{0,2}(\.\d{0,1})?)?$/.test(value) && parseFloat(value || "0") <= 10) {
      setStudents((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
      setSaved(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#111827]">Registro de Calificaciones</h2>
          <p className="text-sm text-[#6B7280]">{subject} · Período 2026-I</p>
        </div>
        <button
          onClick={() => setSaved(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all ${saved ? "bg-[#10B981]" : "bg-[#8B5CF6] hover:bg-[#7C3AED]"}`}
        >
          {saved ? <CheckCircle size={18} /> : <Save size={18} />}
          {saved ? "Guardado correctamente" : "Guardar calificaciones"}
        </button>
      </div>

      {/* Spreadsheet table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E3A8A] text-white">
                <th className="text-left py-4 px-5 text-xs uppercase tracking-wide" style={{ fontWeight: 600, minWidth: "200px" }}>Estudiante</th>
                <th className="text-center py-4 px-4 text-xs uppercase tracking-wide" style={{ fontWeight: 600, minWidth: "130px" }}>
                  <div>Nota Parcial 1</div>
                  <div className="text-blue-200 text-xs normal-case" style={{ fontWeight: 400 }}>30%</div>
                </th>
                <th className="text-center py-4 px-4 text-xs uppercase tracking-wide" style={{ fontWeight: 600, minWidth: "130px" }}>
                  <div>Nota Parcial 2</div>
                  <div className="text-blue-200 text-xs normal-case" style={{ fontWeight: 400 }}>30%</div>
                </th>
                <th className="text-center py-4 px-4 text-xs uppercase tracking-wide" style={{ fontWeight: 600, minWidth: "130px" }}>
                  <div>Examen Final</div>
                  <div className="text-blue-200 text-xs normal-case" style={{ fontWeight: 400 }}>40%</div>
                </th>
                <th className="text-center py-4 px-5 text-xs uppercase tracking-wide bg-[#1E40AF]" style={{ fontWeight: 600, minWidth: "130px" }}>
                  <div className="flex items-center justify-center gap-1.5">
                    <Lock size={12} />
                    Promedio Auto.
                  </div>
                </th>
                <th className="text-center py-4 px-5 text-xs uppercase tracking-wide" style={{ fontWeight: 600, minWidth: "100px" }}>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const avg = calcAverage(student.p1, student.p2, student.final);
                const passed = parseFloat(avg) >= 7;
                return (
                  <tr
                    key={student.id}
                    className={`border-b border-[#F3F4F6] transition-colors hover:bg-[#F8FAFC] ${idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${student.color} flex items-center justify-center text-white text-xs flex-shrink-0`} style={{ fontWeight: 700 }}>
                          {student.initials}
                        </div>
                        <span className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>{student.name}</span>
                      </div>
                    </td>
                    {(["p1", "p2", "final"] as const).map((field) => (
                      <td key={field} className="py-3.5 px-4 text-center">
                        <input
                          type="text"
                          value={student[field]}
                          onChange={(e) => updateGrade(student.id, field, e.target.value)}
                          className={`w-20 text-center py-2 px-3 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-sm transition-all ${gradeColor(student[field])}`}
                          style={{ fontWeight: 600 }}
                          placeholder="0.0"
                        />
                      </td>
                    ))}
                    <td className="py-3.5 px-5 text-center bg-[#F8FAFC]">
                      <div className={`text-lg ${gradeColor(avg)}`} style={{ fontWeight: 700 }}>{avg}</div>
                      <div className="h-1.5 w-16 mx-auto mt-1 rounded-full bg-[#E5E7EB]">
                        <div
                          className={`h-1.5 rounded-full ${parseFloat(avg) >= 8 ? "bg-[#10B981]" : parseFloat(avg) >= 7 ? "bg-[#F59E0B]" : "bg-[#EF4444]"}`}
                          style={{ width: `${Math.min(parseFloat(avg) * 10, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs ${passed ? "bg-[#F0FDF4] text-[#065F46]" : "bg-[#FEF2F2] text-[#991B1B]"}`} style={{ fontWeight: 600 }}>
                        {passed ? "Aprobado" : "Reprobado"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Footer summary */}
            <tfoot>
              <tr className="bg-[#F0F4FF] border-t-2 border-[#BFDBFE]">
                <td className="py-4 px-5 text-sm text-[#374151]" style={{ fontWeight: 600 }}>Promedio del grupo</td>
                {(["p1", "p2", "final"] as const).map((field) => {
                  const groupAvg = (students.reduce((s, st) => s + parseFloat(st[field] || "0"), 0) / students.length).toFixed(1);
                  return (
                    <td key={field} className="py-4 px-4 text-center">
                      <span className={`text-sm ${gradeColor(groupAvg)}`} style={{ fontWeight: 700 }}>{groupAvg}</span>
                    </td>
                  );
                })}
                <td className="py-4 px-5 text-center bg-[#EFF6FF]">
                  <span className="text-[#1D4ED8] text-lg" style={{ fontWeight: 700 }}>
                    {(students.reduce((s, st) => s + parseFloat(calcAverage(st.p1, st.p2, st.final)), 0) / students.length).toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-5 text-center">
                  <span className="text-sm text-[#374151]">
                    {students.filter((s) => parseFloat(calcAverage(s.p1, s.p2, s.final)) >= 7).length}/{students.length} aprobados
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

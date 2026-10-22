import { useState } from "react";
import { Save, CheckSquare, Square, Users, CheckCircle, AlertCircle } from "lucide-react";

interface AttendanceViewProps {
  subject: string;
}

const students = [
  { id: 1, name: "Carlos Andrade", email: "c.andrade@futurodigital.edu", code: "2023-001", initials: "CA", color: "from-blue-400 to-blue-600" },
  { id: 2, name: "María Sánchez", email: "m.sanchez@futurodigital.edu", code: "2023-002", initials: "MS", color: "from-pink-400 to-pink-600" },
  { id: 3, name: "José Ramírez", email: "j.ramirez@futurodigital.edu", code: "2023-003", initials: "JR", color: "from-green-400 to-green-600" },
  { id: 4, name: "Ana López", email: "a.lopez@futurodigital.edu", code: "2023-004", initials: "AL", color: "from-purple-400 to-purple-600" },
  { id: 5, name: "Pedro Gómez", email: "p.gomez@futurodigital.edu", code: "2023-005", initials: "PG", color: "from-orange-400 to-orange-600" },
  { id: 6, name: "Lucía Torres", email: "l.torres@futurodigital.edu", code: "2023-006", initials: "LT", color: "from-teal-400 to-teal-600" },
  { id: 7, name: "Miguel Herrera", email: "m.herrera@futurodigital.edu", code: "2023-007", initials: "MH", color: "from-red-400 to-red-600" },
  { id: 8, name: "Sofía Vargas", email: "s.vargas@futurodigital.edu", code: "2023-008", initials: "SV", color: "from-yellow-400 to-yellow-600" },
  { id: 9, name: "Diego Mora", email: "d.mora@futurodigital.edu", code: "2023-009", initials: "DM", color: "from-indigo-400 to-indigo-600" },
  { id: 10, name: "Valentina Cruz", email: "v.cruz@futurodigital.edu", code: "2023-010", initials: "VC", color: "from-rose-400 to-rose-600" },
  { id: 11, name: "Roberto Mejía", email: "r.mejia@futurodigital.edu", code: "2023-011", initials: "RM", color: "from-cyan-400 to-cyan-600" },
  { id: 12, name: "Isabella Ríos", email: "i.rios@futurodigital.edu", code: "2023-012", initials: "IR", color: "from-violet-400 to-violet-600" },
];

export function AttendanceView({ subject }: AttendanceViewProps) {
  const [attendance, setAttendance] = useState<Record<number, boolean>>(
    Object.fromEntries(students.map((s) => [s.id, true]))
  );
  const [saved, setSaved] = useState(false);

  const toggle = (id: number) => {
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const toggleAll = () => {
    const allPresent = students.every((s) => attendance[s.id]);
    setAttendance(Object.fromEntries(students.map((s) => [s.id, !allPresent])));
    setSaved(false);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  const handleSave = () => setSaved(true);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users size={22} className="text-[#8B5CF6]" />
            <h2 className="text-[#111827]">Lista de Asistencia</h2>
          </div>
          <p className="text-sm text-[#6B7280]">{subject} · Miércoles 18 de junio, 2026 · Aula 201</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all ${saved ? "bg-[#10B981]" : "bg-[#8B5CF6] hover:bg-[#7C3AED]"}`}
        >
          {saved ? <CheckCircle size={18} /> : <Save size={18} />}
          {saved ? "Asistencia guardada" : "Guardar asistencia"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-4">
          <div className="bg-[#F5F3FF] rounded-xl p-2.5"><Users size={20} className="text-[#8B5CF6]" /></div>
          <div>
            <p className="text-xs text-[#6B7280]">Total estudiantes</p>
            <p className="text-xl text-[#111827]" style={{ fontWeight: 700 }}>{students.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-4">
          <div className="bg-[#F0FDF4] rounded-xl p-2.5"><CheckCircle size={20} className="text-[#10B981]" /></div>
          <div>
            <p className="text-xs text-[#6B7280]">Presentes</p>
            <p className="text-xl text-[#10B981]" style={{ fontWeight: 700 }}>{presentCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-4">
          <div className="bg-[#FEF2F2] rounded-xl p-2.5"><AlertCircle size={20} className="text-[#EF4444]" /></div>
          <div>
            <p className="text-xs text-[#6B7280]">Ausentes</p>
            <p className="text-xl text-[#EF4444]" style={{ fontWeight: 700 }}>{absentCount}</p>
          </div>
        </div>
      </div>

      {/* Attendance table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <th className="py-4 px-5 text-left">
                <button onClick={toggleAll} className="flex items-center gap-2 text-xs text-[#6B7280] uppercase tracking-wide hover:text-[#374151] transition-colors" style={{ fontWeight: 600 }}>
                  {students.every((s) => attendance[s.id]) ? <CheckSquare size={16} className="text-[#8B5CF6]" /> : <Square size={16} />}
                  Asistencia
                </button>
              </th>
              <th className="py-4 px-5 text-left text-xs text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>Foto</th>
              <th className="py-4 px-5 text-left text-xs text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>Nombre</th>
              <th className="py-4 px-5 text-left text-xs text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>Correo</th>
              <th className="py-4 px-5 text-left text-xs text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>Código</th>
              <th className="py-4 px-5 text-left text-xs text-[#6B7280] uppercase tracking-wide" style={{ fontWeight: 600 }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const isPresent = attendance[student.id];
              return (
                <tr
                  key={student.id}
                  onClick={() => toggle(student.id)}
                  className={`border-b border-[#F3F4F6] cursor-pointer transition-colors hover:bg-[#FAFAFA] ${idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"} ${!isPresent ? "opacity-60" : ""}`}
                >
                  <td className="py-4 px-5">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isPresent ? "bg-[#8B5CF6] border-[#8B5CF6]" : "border-[#D1D5DB] bg-white"}`}>
                      {isPresent && <div className="w-3 h-3 bg-white rounded-sm" />}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${student.color} flex items-center justify-center text-white text-sm`} style={{ fontWeight: 700 }}>
                      {student.initials}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-[#111827]" style={{ fontWeight: 500 }}>{student.name}</td>
                  <td className="py-4 px-5 text-sm text-[#6B7280]">{student.email}</td>
                  <td className="py-4 px-5 text-sm text-[#9CA3AF] font-mono">{student.code}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${isPresent ? "bg-[#F0FDF4] text-[#065F46]" : "bg-[#FEF2F2] text-[#991B1B]"}`} style={{ fontWeight: 600 }}>
                      {isPresent ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {isPresent ? "Presente" : "Ausente"}
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

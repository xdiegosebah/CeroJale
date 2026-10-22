import "../styles/fonts.css";
import { useState } from "react";
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, ChevronRight,
  AlertCircle, Sparkles, UserRound, BookOpen
} from "lucide-react";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { TeacherDashboard } from "./components/teacher/TeacherDashboard";

type Role = "student" | "teacher";
type Screen = "login" | "student" | "teacher";

const CREDENTIALS = {
  student: { email: "carlos.andrade@futurodigital.edu", password: "1234", label: "Estudiante" },
  teacher: { email: "roberto.martinez@futurodigital.edu", password: "1234", label: "Docente" },
};

function CeroJaleSVGPaths() {
  return (
    <>
      <rect width="400" height="500" fill="#FFFFFF" />
      <rect x="86" y="46" width="172" height="23" rx="5" fill="#001E3C" />
      <circle cx="172" cy="46" r="5.5" fill="#002E5C" />
      <rect x="112" y="67" width="120" height="22" rx="6" fill="#002545" />
      <line x1="258" y1="57" x2="275" y2="85" stroke="#002545" strokeWidth="3" strokeLinecap="round" />
      <rect x="269" y="84" width="12" height="20" rx="3.5" fill="#002545" />
      <rect x="271" y="82" width="8" height="5" rx="1.5" fill="#001E3C" />
      <rect x="98" y="84" width="142" height="154" rx="18" fill="#003B71" />
      <rect x="98" y="84" width="16" height="154" rx="10" fill="#002045" />
      <rect x="224" y="91" width="13" height="140" rx="5" fill="#1A6BC2" />
      <rect x="112" y="99" width="106" height="114" rx="11" fill="#004590" />
      <circle cx="178" cy="140" r="13" fill="white" />
      <circle cx="180" cy="141.5" r="6.5" fill="#001830" />
      <circle cx="182.5" cy="139" r="2" fill="white" />
      <path d="M 135 138 Q 149.5 126.5 164 138" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="149" y1="127" x2="149" y2="121" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 141 158 Q 163 177 186 158" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 263 158 L 285 190 L 332 116" stroke="#28E87C" strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="200" y="276" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontSize="54" fontWeight="900" letterSpacing="-0.5">
        <tspan fill="#003B71">Cero</tspan><tspan fill="#28E87C">Jale</tspan>
      </text>
      <text x="200" y="308" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontSize="10" fontWeight="700" fill="#6B82A0" letterSpacing="2.5">
        TUTORÍA • APRENDIZAJE • RESULTADOS
      </text>
      <line x1="88" y1="324" x2="312" y2="324" stroke="#E2E8F0" strokeWidth="1" />
      <text x="200" y="366" textAnchor="middle" fontFamily="'Dancing Script', cursive" fontSize="34" fontWeight="700" fill="#001E3C">
        Tú puedes.
      </text>
      <path d="M 125 377 Q 163 385 200 383 Q 237 381 275 377" stroke="#28E87C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function LoginBanner() {
  return (
    <svg viewBox="80 40 266 258" width="200" height="194" xmlns="http://www.w3.org/2000/svg">
      <CeroJaleSVGPaths />
    </svg>
  );
}

function LoginScreen({ onLogin }: { onLogin: (screen: Screen) => void }) {
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const creds = CREDENTIALS[role];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      email.trim().toLowerCase() === creds.email &&
      password === creds.password
    ) {
      onLogin(role === "student" ? "student" : "teacher");
    } else {
      setError(`Credenciales incorrectas para ${creds.label}.`);
    }
  };

  const autofill = () => {
    setEmail(creds.email);
    setPassword(creds.password);
    setError("");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #003B71 0%, #00529B 50%, #0072CE 100%)" }}
    >
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Banner */}
        <div className="bg-gradient-to-br from-[#003B71] to-[#0072CE] px-6 pt-6 pb-5 text-center">
          <div className="inline-block bg-white rounded-2xl shadow-xl overflow-hidden" style={{ lineHeight: 0 }}>
            <LoginBanner />
          </div>
          <p className="text-xs text-blue-100 font-medium mt-3">
            Portal Académico Institucional · Sistema InfoSIL
          </p>
        </div>

        <div className="p-8 space-y-5">
          {/* Role selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ingresar como</p>
            <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
              {(["student", "teacher"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(""); setEmail(""); setPassword(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    role === r
                      ? r === "student"
                        ? "bg-[#1E3A8A] text-white shadow-md"
                        : "bg-[#4C1D95] text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {r === "student" ? <UserRound size={15} /> : <BookOpen size={15} />}
                  {r === "student" ? "Estudiante" : "Docente"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3.5 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Correo Institucional</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={creds.email}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:bg-white text-gray-900 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:bg-white text-gray-900 transition-all placeholder:text-gray-400"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: role === "student" ? "linear-gradient(135deg,#1E3A8A,#3B82F6)" : "linear-gradient(135deg,#4C1D95,#8B5CF6)" }}
            >
              Ingresar al Sistema <ChevronRight size={17} />
            </button>
          </form>

          <div className="pt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={autofill}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003B71] text-xs font-semibold border border-blue-200 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={13} className="text-[#0072CE]" />
              Autocompletar credenciales de {role === "student" ? "Estudiante" : "Docente"}
            </button>
          </div>

          <p className="text-[11px] text-center text-gray-400">
            © 2026 Futuro Digital · Sistema Académico InfoSIL
          </p>
        </div>
      </div>
    </div>
  );
}

export interface EnrollmentRequest {
  id: string;
  studentName: string;
  subjectId: number;
  subjectName: string;
  teacher: string;
  credits: number;
  day: string;
  time: string;
  campus: string;
  cost: number;
  status: "Pendiente" | "Aprobado" | "Rechazado";
  createdAt: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);

  const handleEnroll = (req: Omit<EnrollmentRequest, "id" | "status" | "createdAt">) => {
    setEnrollmentRequests((prev) => [
      {
        ...req,
        id: `MAT-${String(prev.length + 1).padStart(3, "0")}`,
        status: "Pendiente",
        createdAt: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
  };

  const handleApprove = (id: string) =>
    setEnrollmentRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Aprobado" } : r));

  const handleReject = (id: string) =>
    setEnrollmentRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Rechazado" } : r));

  if (screen === "student")
    return <StudentDashboard onLogout={() => setScreen("login")} onEnroll={handleEnroll} enrollmentRequests={enrollmentRequests} />;
  if (screen === "teacher")
    return <TeacherDashboard onLogout={() => setScreen("login")} enrollmentRequests={enrollmentRequests} onApprove={handleApprove} onReject={handleReject} />;
  return <LoginScreen onLogin={setScreen} />;
}

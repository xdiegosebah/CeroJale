import React, { useState } from "react";
import {
  GraduationCap,
  Search,
  Star,
  UserRound,
  BookOpen,
  CheckCircle2,
  Filter,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  Clock,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Bell,
  AlertCircle,
  Video,
  UserCheck,
  Sparkles,
} from "lucide-react";

// ── CeroJale Logo ──────────────────────────────────────────────────────────

function CeroJaleSVGPaths() {
  return (
    <>
      <rect width="400" height="500" fill="#FFFFFF" />
      {/* graduation cap board */}
      <rect x="86" y="46" width="172" height="23" rx="5" fill="#001E3C" />
      <circle cx="172" cy="46" r="5.5" fill="#002E5C" />
      {/* cap headband */}
      <rect x="112" y="67" width="120" height="22" rx="6" fill="#002545" />
      {/* tassel */}
      <line x1="258" y1="57" x2="275" y2="85" stroke="#002545" strokeWidth="3" strokeLinecap="round" />
      <rect x="269" y="84" width="12" height="20" rx="3.5" fill="#002545" />
      <rect x="271" y="82" width="8" height="5" rx="1.5" fill="#001E3C" />
      {/* book body */}
      <rect x="98" y="84" width="142" height="154" rx="18" fill="#003B71" />
      <rect x="98" y="84" width="16" height="154" rx="10" fill="#002045" />
      {/* page edge right */}
      <rect x="224" y="91" width="13" height="140" rx="5" fill="#1A6BC2" />
      <line x1="224" y1="102" x2="237" y2="102" stroke="#2278D0" strokeWidth="1" opacity="0.6" />
      <line x1="224" y1="112" x2="237" y2="112" stroke="#2278D0" strokeWidth="1" opacity="0.4" />
      <line x1="224" y1="122" x2="237" y2="122" stroke="#2278D0" strokeWidth="1" opacity="0.3" />
      {/* face panel */}
      <rect x="112" y="99" width="106" height="114" rx="11" fill="#004590" />
      {/* open right eye */}
      <circle cx="178" cy="140" r="13" fill="white" />
      <circle cx="180" cy="141.5" r="6.5" fill="#001830" />
      <circle cx="182.5" cy="139" r="2" fill="white" />
      {/* winking left eye */}
      <path d="M 135 138 Q 149.5 126.5 164 138" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="149" y1="127" x2="149" y2="121" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* smile */}
      <path d="M 141 158 Q 163 177 186 158" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* checkmark shadow */}
      <path d="M 263 158 L 285 190 L 332 116" stroke="#17A850" strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.2" transform="translate(2, 3)" />
      {/* checkmark */}
      <path d="M 263 158 L 285 190 L 332 116" stroke="#28E87C" strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* "CeroJale" wordmark */}
      <text x="200" y="276" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontSize="54" fontWeight="900" letterSpacing="-0.5">
        <tspan fill="#003B71">Cero</tspan>
        <tspan fill="#28E87C">Jale</tspan>
      </text>
      {/* tagline */}
      <text x="200" y="308" textAnchor="middle" fontFamily="'Nunito', sans-serif" fontSize="10" fontWeight="700" fill="#6B82A0" letterSpacing="2.5">
        TUTORÍA • APRENDIZAJE • RESULTADOS
      </text>
      {/* separator */}
      <line x1="88" y1="324" x2="312" y2="324" stroke="#E2E8F0" strokeWidth="1" />
      {/* "Tú puedes." script */}
      <text x="200" y="366" textAnchor="middle" fontFamily="'Dancing Script', cursive" fontSize="34" fontWeight="700" fill="#001E3C">
        Tú puedes.
      </text>
      <path d="M 125 377 Q 163 385 200 383 Q 237 381 275 377" stroke="#28E87C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </>
  );
}

/** Full compact logo for the login card banner */
function CeroJaleLogoBanner() {
  return (
    <svg viewBox="80 40 266 258" width="215" height="208" xmlns="http://www.w3.org/2000/svg">
      <CeroJaleSVGPaths />
    </svg>
  );
}

/** Mini mascot icon for the top header */
function CeroJaleMiniIcon() {
  return (
    <svg viewBox="84 42 200 202" width="45" height="46" xmlns="http://www.w3.org/2000/svg">
      <CeroJaleSVGPaths />
    </svg>
  );
}

type Role = "student" | "teacher";

interface Tutor {
  id: number;
  name: string;
  career: string;
  course: string;
  rating: number;
  reviews: number;
  price: number;
  status: string;
  avatar: string;
  verified: boolean;
}

interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  tutorName: string;
  course: string;
  price: number;
  date: string;
  time: string;
  modality: string;
  status: "Pendiente" | "Aprobado" | "Completado";
  createdAt: string;
}

const tutorsData: Tutor[] = [
  {
    id: 1,
    name: "Mateo Benavides",
    career: "Ing. Empresarial",
    course: "Cálculo de una variable",
    rating: 4.9,
    reviews: 38,
    price: 30,
    status: "Disponible hoy",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    id: 2,
    name: "Sofía Morales",
    career: "Comunicaciones",
    course: "Lenguaje 2",
    rating: 4.8,
    reviews: 25,
    price: 25,
    status: "Disponible mañana",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    id: 3,
    name: "Diego Ramos",
    career: "Economía",
    course: "Estadística",
    rating: 5.0,
    reviews: 42,
    price: 35,
    status: "Disponible hoy",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    id: 4,
    name: "Camila Flores",
    career: "Finanzas",
    course: "Matemática Financiera",
    rating: 4.9,
    reviews: 31,
    price: 32,
    status: "Últimos cupos",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    id: 5,
    name: "Alejandro Torres",
    career: "Ing. de Sistemas",
    course: "Programación orientada a objetos",
    rating: 4.9,
    reviews: 50,
    price: 35,
    status: "Disponible hoy",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    id: 6,
    name: "Lucía Mendoza",
    career: "Ing. Industrial",
    course: "Física I",
    rating: 4.7,
    reviews: 19,
    price: 28,
    status: "Próxima fecha: Viernes",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    id: 7,
    name: "Gabriel Vargas",
    career: "Ing. Civil",
    course: "Cálculo de una variable",
    rating: 4.8,
    reviews: 29,
    price: 30,
    status: "Disponible hoy",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
];

export function InfoSILTutoringDashboard() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Role and Filtering
  const [role, setRole] = useState<Role>("student");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("Todos");

  // Enrollment Modal & Shared Enrollment Records
  const [selectedTutorModal, setSelectedTutorModal] = useState<Tutor | null>(null);
  const [enrollmentModality, setEnrollmentModality] = useState("Virtual MS Teams");
  const [enrollmentDate, setEnrollmentDate] = useState("2026-06-25");
  const [enrollmentTime, setEnrollmentTime] = useState("16:00");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Enrollments list shared between student enrollment & teacher view
  const [enrollments, setEnrollments] = useState<Enrollment[]>([
    {
      id: "SOL-101",
      studentName: "María Fernández",
      studentEmail: "maria.fernandez@usil.pe",
      tutorName: "Mateo Benavides",
      course: "Cálculo de una variable",
      price: 30,
      date: "2026-06-24",
      time: "15:00",
      modality: "Presencial Campus La Molina",
      status: "Aprobado",
      createdAt: "Hoy, 10:15 am",
    },
    {
      id: "SOL-102",
      studentName: "Carlos Gutiérrez",
      studentEmail: "carlos.gutierrez@usil.pe",
      tutorName: "Diego Ramos",
      course: "Estadística",
      price: 35,
      date: "2026-06-24",
      time: "18:00",
      modality: "Virtual MS Teams",
      status: "Pendiente",
      createdAt: "Hoy, 11:30 am",
    },
  ]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim().toLowerCase() === "diego.poma@usil.pe" && passwordInput === "1234") {
      setIsAuthenticated(true);
      setLoginError("");
      setToastMessage("¡Bienvenido Diego Poma a InfoSIL Asesorías!");
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setLoginError("Credenciales incorrectas. Usa: diego.poma@usil.pe / 1234");
    }
  };

  const handleQuickDemoFill = () => {
    setEmailInput("diego.poma@usil.pe");
    setPasswordInput("1234");
    setLoginError("");
  };

  const handleOpenEnrollmentModal = (tutor: Tutor) => {
    setSelectedTutorModal(tutor);
  };

  const handleConfirmEnrollment = () => {
    if (!selectedTutorModal) return;

    const newEnrollment: Enrollment = {
      id: `SOL-${100 + enrollments.length + 1}`,
      studentName: "Diego Poma",
      studentEmail: "diego.poma@usil.pe",
      tutorName: selectedTutorModal.name,
      course: selectedTutorModal.course,
      price: selectedTutorModal.price,
      date: enrollmentDate,
      time: enrollmentTime,
      modality: enrollmentModality,
      status: "Pendiente",
      createdAt: "Recién solicitado",
    };

    setEnrollments([newEnrollment, ...enrollments]);
    setSelectedTutorModal(null);
    setToastMessage(`¡Inscripción solicitada con éxito para ${selectedTutorModal.course}! Ahora figura en el Modo Docente.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleApproveEnrollment = (id: string) => {
    setEnrollments(
      enrollments.map((item) =>
        item.id === id ? { ...item, status: "Aprobado" } : item
      )
    );
    setToastMessage(`Solicitud ${id} aprobada con éxito.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const courses = [
    "Todos",
    "Cálculo de una variable",
    "Lenguaje 2",
    "Estadística",
    "Matemática Financiera",
    "Programación orientada a objetos",
    "Física I",
  ];

  const filteredTutors = tutorsData.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      selectedCourse === "Todos" || tutor.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // SCREEN 1: LOGIN FORM
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #003B71 0%, #00529B 50%, #0072CE 100%)",
        }}
      >
        {/* Background decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 z-10">
          {/* Card Banner */}
          <div className="bg-gradient-to-br from-[#003B71] to-[#0072CE] px-6 pt-6 pb-4 text-white text-center relative">
            <div className="inline-block bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ lineHeight: 0 }}>
              <CeroJaleLogoBanner />
            </div>
            <p className="text-xs text-blue-100 font-medium mt-3">
              Portal Institucional de Asesorías Académicas USIL
            </p>
          </div>

          {/* Form container */}
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#003B71]">Iniciar Sesión</h2>
              <p className="text-xs text-gray-500 mt-1">
                Ingresa con tu correo institucional de alumno o docente.
              </p>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3.5 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Correo Institucional USIL
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="diego.poma@usil.pe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:bg-white text-gray-900 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:bg-white text-gray-900 transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #003B71, #0072CE)",
                }}
              >
                <span>Ingresar al Sistema</span>
                <ChevronRight size={18} />
              </button>
            </form>

            {/* DEMO LOGIN BUTTON */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003B71] text-xs font-semibold border border-blue-200 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={14} className="text-[#0072CE]" />
                <span>Autocompletar Credenciales (diego.poma@usil.pe / 1234)</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-gray-400">
              © 2026 Universidad San Ignacio de Loyola · Sistema InfoSIL
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: LOGGED IN DASHBOARD (Estudiante / Docente views)
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#003B71] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER TIPO INFOSIL */}
      <header className="bg-gradient-to-r from-[#003B71] via-[#00529B] to-[#0072CE] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden" style={{ lineHeight: 0 }}>
              <CeroJaleMiniIcon />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-white">Cero</span>
                  <span style={{ color: "#28E87C" }}>Jale</span>
                </h1>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-blue-100 uppercase tracking-wider font-bold">
                  InfoSIL 2026-I
                </span>
              </div>
              <p className="text-xs text-blue-100">Portal de Asesorías Académicas · USIL</p>
            </div>
          </div>

          {/* SELECTOR DE ROL + USER PILL */}
          <div className="flex items-center gap-3">
            <div className="flex bg-white/15 p-1 rounded-2xl backdrop-blur-md border border-white/20">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  role === "student"
                    ? "bg-white text-[#003B71] shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <UserRound size={15} /> Modo Estudiante
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                  role === "teacher"
                    ? "bg-white text-[#003B71] shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <BookOpen size={15} /> Modo Docente / Asesor
                {enrollments.some((e) => e.status === "Pendiente") && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                )}
              </button>
            </div>

            {/* Logout button */}
            <div className="flex items-center gap-2 bg-white/10 pl-3 pr-1 py-1 rounded-full border border-white/20">
              <span className="text-xs font-bold text-white hidden md:inline">Diego Poma</span>
              <button
                type="button"
                onClick={() => setIsAuthenticated(false)}
                title="Cerrar sesión"
                className="p-1.5 rounded-full bg-white/20 hover:bg-rose-600 text-white transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO DEPENDIENDO DEL ROL SELECCIONADO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === "student" ? (
          /* MODO ESTUDIANTE VIEW */
          <div>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0072CE] bg-blue-50 px-3 py-1 rounded-full mb-2">
                  <ShieldCheck size={14} /> Bienvenido, Diego Poma (diego.poma@usil.pe)
                </div>
                <h2 className="text-3xl font-extrabold text-[#003B71]">Asesorías Académicas</h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  Conecta con alumnos destacados de la comunidad USIL y refuerza tus materias.
                </p>
              </div>

              {/* Status counter for student */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Tus solicitudes:</span>
                  <span className="text-lg font-bold text-[#003B71]">
                    {enrollments.filter((e) => e.studentEmail === "diego.poma@usil.pe").length} registradas
                  </span>
                </div>
              </div>
            </div>

            {/* BÚSQUEDA Y FILTROS */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E7EB] mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                <input
                  type="text"
                  placeholder="Buscar tutor o curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#0072CE] text-[#111827]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={16} className="text-[#003B71] shrink-0" />
                <span className="text-xs font-semibold text-[#374151] uppercase shrink-0">Filtrar por curso:</span>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full md:w-auto border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl px-3 py-2 text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                >
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TARJETAS DE LOS 7 ASESORES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="bg-white rounded-3xl border border-[#E5E7EB] shadow-md hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <img
                        src={tutor.avatar}
                        alt={tutor.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#0072CE]"
                      />
                      <span className="inline-flex items-center gap-1 bg-[#EEF6FC] text-[#003B71] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#D9E2EC]">
                        <CheckCircle2 size={13} className="text-[#0072CE]" /> Verificado USIL
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-[#111827] leading-snug">{tutor.name}</h3>
                    <p className="text-xs text-[#6B7280] mb-4">{tutor.career}</p>

                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-3 mb-4">
                      <span className="text-[10px] font-bold text-[#0072CE] uppercase tracking-wider block mb-1">
                        Curso ofertado
                      </span>
                      <p className="text-sm font-semibold text-[#003B71] leading-tight">
                        {tutor.course}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={16} fill="currentColor" />
                        <span>{tutor.rating.toFixed(1)}</span>
                        <span className="text-xs text-[#9CA3AF] font-normal">({tutor.reviews})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-[#003B71]">S/ {tutor.price.toFixed(2)}</span>
                        <span className="text-xs text-[#6B7280]"> / hr</span>
                      </div>
                    </div>

                    <p className="text-xs text-emerald-600 font-medium mt-1">🟢 {tutor.status}</p>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEnrollmentModal(tutor)}
                      className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #003B71, #0072CE)",
                      }}
                    >
                      Inscribirme
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* MODO DOCENTE / ASESOR VIEW */
          <div className="space-y-6">
            {/* Header docente */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Panel del Docente / Asesor
                </span>
                <h2 className="text-2xl font-bold text-[#003B71] mt-2">
                  Gestión de Solicitudes de Asesorías Recibidas
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Revisa en tiempo real los alumnos inscritos y aprueba sus horarios de tutoría.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2 text-center">
                  <span className="text-[10px] text-blue-700 font-bold uppercase block">Solicitudes Totales</span>
                  <span className="text-xl font-extrabold text-[#003B71]">{enrollments.length}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-center">
                  <span className="text-[10px] text-amber-700 font-bold uppercase block">Por Aprobar</span>
                  <span className="text-xl font-extrabold text-amber-800">
                    {enrollments.filter((e) => e.status === "Pendiente").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabla de inscripciones recibidas */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-[#003B71] text-base flex items-center gap-2">
                  <Bell size={18} className="text-[#0072CE]" />
                  Lista de Alumnos Inscritos
                </h3>
                <span className="text-xs text-gray-400">Actualizado en tiempo real</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Código / Alumno</th>
                      <th className="py-3.5 px-6">Tutor Asignado</th>
                      <th className="py-3.5 px-6">Curso</th>
                      <th className="py-3.5 px-6">Fecha & Hora</th>
                      <th className="py-3.5 px-6">Modalidad</th>
                      <th className="py-3.5 px-6">Monto</th>
                      <th className="py-3.5 px-6">Estado</th>
                      <th className="py-3.5 px-6 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {enrollments.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-900">
                          <div className="font-bold text-[#003B71]">{item.studentName}</div>
                          <div className="text-[11px] text-gray-400">{item.studentEmail}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-700 font-semibold">{item.tutorName}</td>
                        <td className="py-4 px-6">
                          <span className="bg-blue-50 text-[#0072CE] px-2.5 py-1 rounded-lg font-bold">
                            {item.course}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <div>{item.date}</div>
                          <div className="text-[11px] text-gray-400">{item.time} hrs</div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 font-medium">{item.modality}</td>
                        <td className="py-4 px-6 font-bold text-[#003B71]">S/ {item.price.toFixed(2)}</td>
                        <td className="py-4 px-6">
                          {item.status === "Aprobado" ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 size={12} /> Aprobado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              <Clock size={12} /> Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {item.status === "Pendiente" ? (
                            <button
                              type="button"
                              onClick={() => handleApproveEnrollment(item.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              Aprobar
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-semibold">✓ Confirmado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL ENROLLMENT */}
      {selectedTutorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 relative">
            <div className="bg-gradient-to-r from-[#003B71] to-[#0072CE] p-6 text-white relative">
              <button
                type="button"
                onClick={() => setSelectedTutorModal(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={16} />
              </button>
              <h3 className="font-bold text-lg font-heading">Confirmar Inscripción</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Solicitante: <strong className="text-white">Diego Poma (diego.poma@usil.pe)</strong>
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs space-y-1">
                <div className="text-gray-500">Curso:</div>
                <div className="font-bold text-[#003B71] text-sm">{selectedTutorModal.course}</div>
                <div className="text-gray-500 pt-1">Tutor asignado:</div>
                <div className="font-semibold text-gray-800">{selectedTutorModal.name}</div>
                <div className="text-gray-500 pt-1">Inversión:</div>
                <div className="font-extrabold text-[#0072CE] text-sm">S/ {selectedTutorModal.price.toFixed(2)} / hora</div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Selecciona Modalidad:
                </label>
                <select
                  value={enrollmentModality}
                  onChange={(e) => setEnrollmentModality(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                >
                  <option value="Virtual MS Teams">Virtual MS Teams</option>
                  <option value="Presencial Campus La Molina">Presencial Campus La Molina</option>
                  <option value="Presencial Campus San Isidro">Presencial Campus San Isidro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={enrollmentDate}
                    onChange={(e) => setEnrollmentDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Hora:</label>
                  <select
                    value={enrollmentTime}
                    onChange={(e) => setEnrollmentTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2 text-xs font-medium bg-white"
                  >
                    <option value="10:00">10:00 hrs</option>
                    <option value="14:00">14:00 hrs</option>
                    <option value="16:00">16:00 hrs</option>
                    <option value="18:00">18:00 hrs</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmEnrollment}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#003B71] to-[#0072CE] text-white font-bold text-xs shadow-md transition-all hover:opacity-90 mt-2"
              >
                Confirmar Inscripción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

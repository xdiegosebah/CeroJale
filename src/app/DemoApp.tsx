import "../styles/fonts.css";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { TeacherDashboard } from "./components/teacher/TeacherDashboard";
import { CeroJaleMiniSidebar } from "./components/CeroJaleLogo";
import {
  localDate,
  validateBooking,
  validateBookingUpdate,
  validateNewSlot,
  validateReschedule,
} from "./bookingRules";

type Role = "student" | "teacher";
type Screen = "login" | "student" | "teacher";

export type BookingStatus =
  "Pendiente" | "Confirmada" | "Realizada" | "Cancelada";

export interface Review {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  studentName: string;
  advisorId: string;
  advisorName: string;
  course: string;
  date: string;
  time: string;
  modality: "Virtual" | "Presencial";
  location: string;
  duration: number;
  price: number;
  topic: string;
  status: BookingStatus;
  createdAt: string;
  reprogramRequested?: boolean;
  reprogramSlotId?: string;
  reprogramNotice?: string;
  review?: Review;
}

export interface AvailabilitySlot {
  id: string;
  advisorId: string;
  date: string;
  time: string;
  modality: "Virtual" | "Presencial";
  location: string;
}

const ACTIVE_ADVISOR_ID = "roberto";
const STORAGE_BOOKINGS = "cerojale-bookings-v1";
const STORAGE_SLOTS = "cerojale-slots-v1";

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDate(date);
}

const DEFAULT_SLOTS: AvailabilitySlot[] = [
  {
    id: "rob-1",
    advisorId: "roberto",
    date: futureDate(1),
    time: "16:00",
    modality: "Virtual",
    location: "Sala virtual CeroJale",
  },
  {
    id: "rob-2",
    advisorId: "roberto",
    date: futureDate(2),
    time: "18:00",
    modality: "Presencial",
    location: "Campus La Molina",
  },
  {
    id: "rob-3",
    advisorId: "roberto",
    date: futureDate(4),
    time: "10:00",
    modality: "Virtual",
    location: "Sala virtual CeroJale",
  },
  {
    id: "ana-1",
    advisorId: "ana",
    date: futureDate(1),
    time: "17:00",
    modality: "Virtual",
    location: "Sala virtual CeroJale",
  },
  {
    id: "ana-2",
    advisorId: "ana",
    date: futureDate(3),
    time: "15:00",
    modality: "Presencial",
    location: "Campus San Isidro",
  },
  {
    id: "carlos-1",
    advisorId: "carlos",
    date: futureDate(2),
    time: "11:00",
    modality: "Virtual",
    location: "Sala virtual CeroJale",
  },
  {
    id: "diana-1",
    advisorId: "diana",
    date: futureDate(1),
    time: "13:00",
    modality: "Presencial",
    location: "Campus La Molina",
  },
  {
    id: "patricia-1",
    advisorId: "patricia",
    date: futureDate(3),
    time: "19:00",
    modality: "Virtual",
    location: "Sala virtual CeroJale",
  },
  {
    id: "miguel-1",
    advisorId: "miguel",
    date: futureDate(5),
    time: "09:00",
    modality: "Presencial",
    location: "Campus La Molina",
  },
];

const CREDENTIALS = {
  student: {
    email: "carlos.andrade@usil.pe",
    password: "1234",
    label: "Estudiante",
  },
  teacher: {
    email: "roberto.martinez@usil.pe",
    password: "1234",
    label: "Asesor",
  },
};

function readStored<T>(key: string, fallback: T[]): T[] {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : fallback;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function LoginScreen({ onLogin }: { onLogin: (screen: Screen) => void }) {
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const creds = CREDENTIALS[role];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    // Keep the original demonstration credentials working for existing users.
    const legacyEmail = creds.email.replace("@usil.pe", "@futurodigital.edu");
    if (
      [creds.email, legacyEmail].includes(email.trim().toLowerCase()) &&
      password === creds.password
    ) {
      onLogin(role);
    } else {
      setError(
        `Credenciales incorrectas para ${creds.label}. Usa el acceso de demostración.`,
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#003B71] via-[#00529B] to-[#0072CE]">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-[#003B71] to-[#0072CE] px-6 py-7 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">
            <CeroJaleMiniSidebar size={72} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Cero<span className="text-[#28E87C]">Jale</span>
          </h1>
          <p className="mt-1 text-xs font-medium text-blue-100">
            Portal de asesorías académicas para estudiantes USIL
          </p>
        </div>
        <div className="space-y-5 p-7 sm:p-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Ingresar como
            </p>
            <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
              {(["student", "teacher"] as Role[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setRole(item);
                    setError("");
                    setEmail("");
                    setPassword("");
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${role === item ? (item === "student" ? "bg-[#1E3A8A] text-white shadow" : "bg-[#4C1D95] text-white shadow") : "text-gray-500"}`}
                >
                  {item === "student" ? (
                    <UserRound size={16} />
                  ) : (
                    <BookOpen size={16} />
                  )}
                  {item === "student" ? "Estudiante" : "Asesor"}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-xs font-semibold text-gray-700">
              Correo institucional
              <span className="relative mt-1.5 block">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={creds.email}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#0072CE]"
                />
              </span>
            </label>
            <label className="block text-xs font-semibold text-gray-700">
              Contraseña
              <span className="relative mt-1.5 block">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  required
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#0072CE]"
                />
                <button
                  type="button"
                  aria-label="Mostrar contraseña"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <button
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow ${role === "student" ? "bg-[#1E3A8A]" : "bg-[#4C1D95]"}`}
            >
              Ingresar a CeroJale <ChevronRight size={17} />
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setEmail(creds.email);
              setPassword(creds.password);
              setError("");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-[#003B71]"
          >
            <Sparkles size={14} /> Autocompletar acceso de demostración
          </button>
          <p className="text-center text-[11px] text-gray-500">
            Acceso de demostración, sin autenticación real. Los cambios solo se
            guardan en este navegador, sin sincronización entre dispositivos ni
            pagos reales.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [bookings, setBookings] = useState<Booking[]>(() =>
    readStored(STORAGE_BOOKINGS, []),
  );
  const [slots, setSlots] = useState<AvailabilitySlot[]>(() =>
    readStored(STORAGE_SLOTS, DEFAULT_SLOTS),
  );
  const bookingsRef = useRef(bookings);
  const slotsRef = useRef(slots);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOOKINGS, JSON.stringify(bookings));
      localStorage.setItem(STORAGE_SLOTS, JSON.stringify(slots));
      setStorageError("");
    } catch {
      setStorageError(
        "No se pudieron guardar los cambios en este navegador. Se conservarán solo hasta que recargues.",
      );
    }
  }, [bookings, slots]);

  const saveBookings = (next: Booking[]) => {
    bookingsRef.current = next;
    setBookings(next);
  };
  const saveSlots = (next: AvailabilitySlot[]) => {
    slotsRef.current = next;
    setSlots(next);
  };

  const createBooking = (
    data: Omit<Booking, "id" | "status" | "createdAt">,
  ) => {
    const result = validateBooking(data, slotsRef.current, bookingsRef.current);
    if (!result.ok) return result;
    const booking: Booking = {
      ...data,
      topic: data.topic.trim(),
      id: `RES-${crypto.randomUUID()}`,
      status: "Pendiente",
      createdAt: new Date().toLocaleString("es-PE", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    };
    saveBookings([booking, ...bookingsRef.current]);
    return result;
  };

  const updateBooking = (id: string, changes: Partial<Booking>) => {
    const booking = bookingsRef.current.find((item) => item.id === id);
    if (!booking) return { ok: false, message: "No se encontró la reserva." };
    let resolvedChanges = changes;
    if (changes.reprogramRequested === true) {
      const result = validateReschedule(
        booking,
        changes.reprogramSlotId,
        slotsRef.current,
        bookingsRef.current,
      );
      if (!result.ok) return result;
      resolvedChanges = { ...changes, reprogramNotice: undefined };
    }
    if (changes.date || changes.time || changes.modality || changes.location) {
      // A new schedule can only be accepted from the student's pending proposal.
      const result = validateReschedule(
        booking,
        booking.reprogramSlotId,
        slotsRef.current,
        bookingsRef.current,
        true,
      );
      if (!result.ok) return result;
      const target = slotsRef.current.find(
        (slot) => slot.id === booking.reprogramSlotId,
      )!;
      resolvedChanges = {
        date: target.date,
        time: target.time,
        modality: target.modality,
        location: target.location,
        reprogramRequested: false,
        reprogramSlotId: undefined,
        reprogramNotice:
          "Reprogramación aceptada. Tu calendario ya muestra el nuevo horario.",
      };
    }
    const result = validateBookingUpdate(booking, resolvedChanges);
    if (!result.ok) return result;
    saveBookings(
      bookingsRef.current.map((item) =>
        item.id === id ? { ...item, ...resolvedChanges } : item,
      ),
    );
    return result;
  };

  const addSlot = (slot: Omit<AvailabilitySlot, "id" | "advisorId">) => {
    const result = validateNewSlot(slot, ACTIVE_ADVISOR_ID, slotsRef.current);
    if (!result.ok) return result;
    saveSlots([
      ...slotsRef.current,
      {
        ...slot,
        advisorId: ACTIVE_ADVISOR_ID,
        id: `SLOT-${crypto.randomUUID()}`,
      },
    ]);
    return result;
  };

  const removeSlot = (id: string) => {
    const slot = slotsRef.current.find((item) => item.id === id);
    const occupied =
      slot &&
      bookingsRef.current.some(
        (booking) =>
          booking.advisorId === slot.advisorId &&
          booking.date === slot.date &&
          booking.time === slot.time &&
          booking.status !== "Cancelada",
      );
    if (occupied)
      return {
        ok: false,
        message: "No puedes eliminar un horario que tiene una reserva activa.",
      };
    saveSlots(slotsRef.current.filter((item) => item.id !== id));
    return { ok: true, message: "Horario eliminado." };
  };

  return (
    <>
      {storageError && (
        <div
          role="alert"
          className="fixed bottom-4 left-4 right-4 z-[100] rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 shadow-lg"
        >
          {storageError}
        </div>
      )}
      {screen === "student" ? (
        <StudentDashboard
          onLogout={() => setScreen("login")}
          bookings={bookings}
          slots={slots}
          onBook={createBooking}
          onUpdateBooking={updateBooking}
        />
      ) : screen === "teacher" ? (
        <TeacherDashboard
          onLogout={() => setScreen("login")}
          bookings={bookings}
          slots={slots}
          activeAdvisorId={ACTIVE_ADVISOR_ID}
          onUpdateBooking={updateBooking}
          onAddSlot={addSlot}
          onRemoveSlot={removeSlot}
        />
      ) : (
        <LoginScreen onLogin={setScreen} />
      )}
    </>
  );
}

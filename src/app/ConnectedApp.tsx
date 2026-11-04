import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  BookOpen,
  CalendarDays,
  Clock,
  LogOut,
  Search,
  Star,
  UserRound,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { supabase, friendlyError } from "../lib/supabase";
import { CeroJaleMiniSidebar } from "./components/CeroJaleLogo";
import { DemoModal } from "./components/DemoModal";

type Role = "student" | "advisor";
type Profile = { user_id: string; display_name: string; role: Role };
type Advisor = {
  user_id: string;
  display_name: string;
  specialty: string;
  courses: string[];
  price: number;
  methodology: string;
};
type Slot = {
  id: string;
  advisor_id: string;
  starts_at: string;
  modality: string;
  location: string;
  active: boolean;
};
type Booking = {
  id: string;
  student_id: string;
  advisor_id: string;
  slot_id: string;
  student_name: string;
  advisor_name: string;
  course: string;
  starts_at: string;
  modality: string;
  location: string;
  price: number;
  topic: string;
  status: "Pendiente" | "Confirmada" | "Realizada" | "Cancelada";
  proposed_slot_id: string | null;
  notice: string | null;
};
type Review = {
  booking_id: string;
  advisor_id: string;
  author_name: string;
  rating: number;
  comment: string;
};
type BusySlot = { advisor_id: string; starts_at: string };
type Data = {
  profile: Profile;
  advisors: Advisor[];
  slots: Slot[];
  bookings: Booking[];
  reviews: Review[];
  busy: BusySlot[];
};
type Mutate = (
  action: string,
  payload: Record<string, unknown>,
) => Promise<boolean>;
const field =
  "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-normal text-gray-900 outline-none focus:ring-2 focus:ring-blue-400";
const primary =
  "rounded-xl bg-[#1E3A8A] px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40";
const secondary =
  "rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40";
const panel = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";
const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
const todayLima = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const overlaps = (a: string, b: string) =>
  Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 45 * 60_000;
const ended = (b: Booking) =>
  new Date(b.starts_at).getTime() + 45 * 60_000 <= Date.now();
function Status({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
      {children}
    </span>
  );
}
function Label({ children, title }: { children: ReactNode; title: string }) {
  return (
    <label className="block text-xs font-bold text-gray-700">
      {title}
      {children}
    </label>
  );
}
function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 font-black text-[#1E3A8A]">
      {name
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")}
    </div>
  );
}

function AuthScreen({
  recovery,
  onRecovered,
  initialError,
}: {
  initialError?: string;
  recovery: boolean;
  onRecovered: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || busy) return;
    setError("");
    setMessage("");
    if ((mode === "register" || recovery) && password !== confirmPassword)
      return setError("Las contraseñas no coinciden.");
    setBusy(true);
    try {
      const redirect = window.location.origin + window.location.pathname;
      if (recovery) {
        const result = await supabase.auth.updateUser({ password });
        if (result.error) throw result.error;
        window.history.replaceState({}, "", window.location.pathname);
        onRecovered();
      } else if (mode === "register") {
        const result = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim(), role },
            emailRedirectTo: redirect,
          },
        });
        if (result.error) throw result.error;
        if (!result.data.session) {
          setMessage(
            "Si el registro procede, recibirás un correo para confirmar tu cuenta. Revisa spam y luego vuelve a ingresar.",
          );
          setMode("login");
          setPassword("");
          setConfirmPassword("");
        }
      } else if (mode === "reset") {
        const result = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirect,
        });
        if (result.error) throw result.error;
        setMessage(
          "Si existe una cuenta con ese correo, recibirás un enlace para cambiar tu contraseña.",
        );
      } else {
        const result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (result.error) throw result.error;
      }
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };
  const switchMode = (next: typeof mode) => {
    setMode(next);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#003B71] to-[#0072CE] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="bg-[#003B71] p-7 text-center text-white">
          <div className="mx-auto mb-3 w-fit rounded-2xl bg-white p-2">
            <CeroJaleMiniSidebar size={64} />
          </div>
          <h1 className="text-3xl font-black">
            Cero<span className="text-[#28E87C]">Jale</span>
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Tu apoyo académico, en un solo lugar
          </p>
        </header>
        <form onSubmit={submit} className="space-y-4 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#003B71]">
            {recovery
              ? "Elige una nueva contraseña"
              : mode === "register"
                ? "Crea tu cuenta"
                : mode === "reset"
                  ? "Recupera tu cuenta"
                  : "Inicia sesión"}
          </h2>
          {!supabase && (
            <p role="alert" className="text-sm text-rose-700">
              Falta configurar Supabase en .env.local.
            </p>
          )}
          {mode === "register" && !recovery && (
            <>
              <Label title="Nombre para mostrar">
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={field}
                />
              </Label>
              <Label title="Tipo de cuenta">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className={field}
                >
                  <option value="student">Estudiante</option>
                  <option value="advisor">Asesor</option>
                </select>
              </Label>
            </>
          )}
          {!recovery && (
            <Label title="Correo electrónico">
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
                placeholder="tucorreo@ejemplo.com"
              />
            </Label>
          )}
          {(mode !== "reset" || recovery) && (
            <Label title="Contraseña">
              <input
                required
                minLength={mode === "register" || recovery ? 8 : 1}
                type="password"
                autoComplete={
                  mode === "login" && !recovery
                    ? "current-password"
                    : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </Label>
          )}
          {(mode === "register" || recovery) && (
            <>
              <Label title="Repite la contraseña">
                <input
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={field}
                />
              </Label>
              <p className="text-xs text-gray-500">
                Usa al menos 8 caracteres. Tu contraseña se gestiona con
                Supabase Auth.
              </p>
            </>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800"
            >
              {error}
            </p>
          )}
          {message && (
            <p
              role="status"
              className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {message}
            </p>
          )}
          <button disabled={busy || !supabase} className={`${primary} w-full`}>
            {busy
              ? "Procesando…"
              : recovery
                ? "Guardar contraseña"
                : mode === "register"
                  ? "Crear cuenta"
                  : mode === "reset"
                    ? "Enviar enlace"
                    : "Ingresar"}
          </button>
          {!recovery && (
            <div className="space-y-3 text-center text-sm">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  switchMode(mode === "register" ? "login" : "register")
                }
                className="font-bold text-blue-800"
              >
                {mode === "register"
                  ? "Ya tengo una cuenta"
                  : "Crear una cuenta"}
              </button>
              <br />
              <button
                type="button"
                disabled={busy}
                onClick={() => switchMode(mode === "reset" ? "login" : "reset")}
                className="text-gray-500"
              >
                {mode === "reset"
                  ? "Volver al inicio de sesión"
                  : "Olvidé mi contraseña"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ConnectedApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [recovery, setRecovery] = useState(() =>
    window.location.hash.includes("type=recovery"),
  );
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const mutationLock = useRef(false);
  const [tab, setTab] = useState("catalog");
  useEffect(() => {
    if (!supabase) {
      setInitializing(false);
      return;
    }
    let live = true;
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (live) {
          if (error) setError(friendlyError(error));
          setSession(data.session);
          setInitializing(false);
        }
      })
      .catch((e) => {
        if (live) {
          setError(friendlyError(e));
          setInitializing(false);
        }
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      if (!live) return;
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") {
        generation.current++;
        setData(null);
        setMessage("");
        setTab("catalog");
        setRecovery(false);
      }
      setSession(next);
      setInitializing(false);
    });
    return () => {
      live = false;
      subscription.unsubscribe();
    };
  }, []);
  const load = useCallback(async (userId: string, quiet = false) => {
    if (!supabase) return;
    const ticket = ++generation.current;
    if (!quiet) setLoading(true);
    try {
      const responses = await Promise.all([
        supabase.from("cj_profiles").select("*").eq("user_id", userId).single(),
        supabase.from("cj_advisors").select("*"),
        supabase
          .from("cj_slots")
          .select("*")
          .eq("active", true)
          .order("starts_at"),
        supabase.from("cj_bookings").select("*").order("starts_at"),
        supabase.from("cj_reviews").select("*"),
        supabase.rpc("cj_busy_slots"),
      ]);
      const failed = responses.find((r) => r.error);
      if (failed?.error) throw failed.error;
      if (ticket !== generation.current) return;
      setData({
        profile: responses[0].data as Profile,
        advisors: (responses[1].data ?? []) as Advisor[],
        slots: (responses[2].data ?? []) as Slot[],
        bookings: (responses[3].data ?? []) as Booking[],
        reviews: (responses[4].data ?? []) as Review[],
        busy: (responses[5].data ?? []) as BusySlot[],
      });
      setError("");
    } catch (e) {
      if (ticket === generation.current) setError(friendlyError(e));
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  }, []);
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) {
      generation.current++;
      setData(null);
      setLoading(false);
      return;
    }
    setData(null);
    setTab("catalog");
    void load(userId);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !mutationLock.current)
        void load(userId, true);
    }, 15000);
    const focus = () => {
      if (!mutationLock.current) void load(userId, true);
    };
    window.addEventListener("focus", focus);
    return () => {
      generation.current++;
      window.clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [userId, load]);
  const mutate: Mutate = async (action, payload) => {
    if (!supabase || !userId || mutationLock.current) return false;
    mutationLock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { error } = await supabase.rpc("cj_mutate", {
        p_action: action,
        p_data: payload,
      });
      if (error) throw error;
      await load(userId, true);
      setMessage("Cambios guardados.");
      return true;
    } catch (e) {
      setError(friendlyError(e));
      return false;
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  };
  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setError(friendlyError(error));
  };
  if (initializing)
    return (
      <div className="p-10 text-center text-gray-500">Cargando CeroJale…</div>
    );
  if (!session || recovery)
    return (
      <AuthScreen
        initialError={error}
        recovery={recovery}
        onRecovered={() => {
          setRecovery(false);
          setMessage("Contraseña actualizada.");
        }}
      />
    );
  if (!data)
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <h1 className="text-xl font-bold">Preparando tu cuenta</h1>
        <p role="alert" className="text-sm text-rose-700">
          {error || "Cargando tu perfil…"}
        </p>
        <p className="text-sm text-gray-500">
          Si aún no configuraste las tablas, ejecuta el archivo
          supabase/setup.sql en el SQL Editor de Supabase.
        </p>
        <button
          disabled={loading}
          className={primary}
          onClick={() => void load(session.user.id)}
        >
          Volver a intentar
        </button>{" "}
        <button className={secondary} onClick={() => void logout()}>
          Cerrar sesión
        </button>
      </div>
    );
  const advisor = data.profile.role === "advisor";
  const currentTab = advisor && tab === "catalog" ? "requests" : tab;
  const nav = advisor
    ? [
        { id: "requests", label: "Solicitudes y sesiones", icon: BookOpen },
        { id: "availability", label: "Mi disponibilidad", icon: Clock },
        { id: "profile", label: "Mi perfil", icon: UserRound },
      ]
    : [
        { id: "catalog", label: "Buscar asesorías", icon: Search },
        { id: "bookings", label: "Mis asesorías", icon: BookOpen },
        { id: "calendar", label: "Calendario", icon: CalendarDays },
      ];
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] md:h-screen md:flex-row md:overflow-hidden">
      <aside
        className={`flex w-full shrink-0 flex-col text-white md:w-64 ${advisor ? "bg-[#4C1D95]" : "bg-[#1E3A8A]"}`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <div className="rounded-xl bg-white p-1">
            <CeroJaleMiniSidebar />
          </div>
          <div>
            <p className="font-black">
              Cero<span className="text-[#28E87C]">Jale</span>
            </p>
            <p className="text-xs text-white/70">
              {advisor ? "Panel del asesor" : "Asesorías académicas"}
            </p>
          </div>
        </div>
        <div className="hidden border-b border-white/10 p-5 md:block">
          <p className="font-bold">{data.profile.display_name}</p>
          <p className="mt-1 break-all text-xs text-white/70">
            {session.user.email}
          </p>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-3 md:flex-1 md:flex-col md:p-4">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setMessage("");
              }}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${currentTab === item.id ? "bg-white font-bold text-[#003B71]" : "text-white/80 hover:bg-white/10"}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <button
          disabled={busy}
          onClick={() => void logout()}
          className="m-3 flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-white/10"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col md:overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {nav.find((n) => n.id === currentTab)?.label}
            </h1>
            <p className="text-xs text-gray-500">
              Horarios de Lima · Sesiones de 45 minutos
            </p>
          </div>
          <button
            aria-label="Actualizar datos"
            disabled={loading || busy}
            onClick={() => void load(session.user.id)}
            className={secondary}
          >
            <RefreshCw size={17} />
          </button>
        </header>
        <div className="flex-1 space-y-5 p-4 sm:p-6 md:overflow-y-auto md:p-8">
          {error && (
            <div
              role="alert"
              className="fixed bottom-4 left-4 right-4 z-[100] flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-xl"
            >
              {error}
              <button
                aria-label="Cerrar aviso"
                onClick={() => setError("")}
                className="font-bold"
              >
                Cerrar
              </button>
            </div>
          )}
          {message && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              {message}
            </div>
          )}
          {busy && (
            <p role="status" className="text-sm text-blue-700">
              Guardando…
            </p>
          )}
          {!advisor && currentTab === "catalog" && (
            <Catalog data={data} busy={busy} mutate={mutate} />
          )}
          {!advisor &&
            (currentTab === "bookings" || currentTab === "calendar") && (
              <BookingList
                data={data}
                busy={busy}
                mutate={mutate}
                calendar={currentTab === "calendar"}
              />
            )}
          {advisor && currentTab === "requests" && (
            <BookingList data={data} busy={busy} mutate={mutate} />
          )}
          {advisor && currentTab === "availability" && (
            <Availability data={data} busy={busy} mutate={mutate} />
          )}
          {advisor && currentTab === "profile" && (
            <AdvisorProfile
              key={data.profile.user_id}
              advisor={data.advisors.find(
                (a) => a.user_id === data.profile.user_id,
              )!}
              busy={busy}
              mutate={mutate}
            />
          )}
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={14} />
            Los pagos y las videollamadas no están integrados. Coordina esos
            detalles con tu asesor.
          </p>
        </div>
      </main>
    </div>
  );
}

function freeSlots(data: Data, advisorId: string, excludeId?: string) {
  const excluded = data.bookings.find((b) => b.id === excludeId);
  return data.slots.filter(
    (s) =>
      s.advisor_id === advisorId &&
      s.active &&
      new Date(s.starts_at).getTime() > Date.now() &&
      !data.busy.some(
        (b) =>
          b.advisor_id === s.advisor_id &&
          overlaps(b.starts_at, s.starts_at) &&
          !(
            excluded &&
            b.advisor_id === excluded.advisor_id &&
            b.starts_at === excluded.starts_at
          ),
      ) &&
      !data.bookings.some(
        (b) =>
          b.id !== excludeId &&
          b.status !== "Cancelada" &&
          overlaps(b.starts_at, s.starts_at),
      ) &&
      !(excluded && s.starts_at === excluded.starts_at),
  );
}

function Catalog({
  data,
  busy,
  mutate,
}: {
  data: Data;
  busy: boolean;
  mutate: Mutate;
}) {
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState("35");
  const [modality, setModality] = useState("");
  const [profile, setProfile] = useState<Advisor | null>(null);
  const [selected, setSelected] = useState<Advisor | null>(null);
  const [course, setCourse] = useState("");
  const [slot, setSlot] = useState("");
  const [topic, setTopic] = useState("");
  const [confirm, setConfirm] = useState(false);
  const advisors = data.advisors.filter(
    (a) =>
      a.courses.length &&
      a.courses.some((c) => normalize(c).includes(normalize(search))) &&
      Number(a.price) <= Number(price) &&
      (!modality ||
        freeSlots(data, a.user_id).some((s) => s.modality === modality)),
  );
  const open = (a: Advisor) => {
    setSelected(a);
    setCourse(
      a.courses.find((c) => normalize(c).includes(normalize(search))) ??
        a.courses[0],
    );
    setSlot("");
    setTopic("");
    setConfirm(false);
    setProfile(null);
  };
  const available = selected
    ? freeSlots(data, selected.user_id).filter(
        (s) => !modality || s.modality === modality,
      )
    : [];
  const target = available.find((s) => s.id === slot);
  const reviews = (a: Advisor) =>
    data.reviews.filter((r) => r.advisor_id === a.user_id);
  const rating = (a: Advisor) => {
    const r = reviews(a);
    return r.length
      ? (r.reduce((sum, r) => sum + r.rating, 0) / r.length).toFixed(1)
      : "Sin reseñas";
  };
  return (
    <>
      <div className={`${panel} grid gap-3 sm:grid-cols-3`}>
        <input
          aria-label="Buscar curso"
          placeholder="Busca un curso…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={field}
        />
        <select
          aria-label="Precio máximo"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={field}
        >
          <option value="25">Hasta S/25</option>
          <option value="30">Hasta S/30</option>
          <option value="35">Hasta S/35</option>
        </select>
        <select
          aria-label="Modalidad"
          value={modality}
          onChange={(e) => setModality(e.target.value)}
          className={field}
        >
          <option value="">Todas las modalidades</option>
          <option>Virtual</option>
          <option>Presencial</option>
        </select>
      </div>
      {!advisors.length ? (
        <div className={`${panel} py-12 text-center text-gray-500`}>
          Todavía no hay asesores que coincidan con tu búsqueda. Los asesores
          deben crear su cuenta y completar su perfil para aparecer aquí.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {advisors.map((a) => {
            const slots = freeSlots(data, a.user_id);
            return (
              <article
                key={a.user_id}
                className={`${panel} flex flex-col border-t-4 border-t-[#28E87C]`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={a.display_name} />
                  <div>
                    <h2 className="font-bold text-gray-900">
                      {a.display_name}
                    </h2>
                    <p className="text-xs text-gray-500">{a.specialty}</p>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-amber-700">
                  <Star size={14} />
                  {rating(a)} · {reviews(a).length} opiniones
                </p>
                <p className="my-4 flex-1 font-bold text-[#1E3A8A]">
                  {a.courses.join(" · ")}
                </p>
                <p className="text-sm">S/{a.price} · 45 minutos</p>
                <p className="mt-2 text-xs text-emerald-700">
                  {slots[0]
                    ? `Próximo: ${formatDate(slots[0].starts_at)}`
                    : "Sin horarios disponibles"}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className={secondary} onClick={() => setProfile(a)}>
                    Ver perfil
                  </button>
                  <button
                    disabled={!slots.length || busy}
                    className={primary}
                    onClick={() => open(a)}
                  >
                    Reservar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {profile && (
        <DemoModal
          title={`Perfil de ${profile.display_name}`}
          onClose={() => setProfile(null)}
        >
          <div className="space-y-5 p-6 pt-10">
            <div className="flex items-center gap-3">
              <Avatar name={profile.display_name} />
              <h2 className="text-xl font-bold">{profile.display_name}</h2>
            </div>
            <p className="text-sm text-gray-500">{profile.specialty}</p>
            <p className="font-bold text-blue-900">
              {profile.courses.join(" · ")}
            </p>
            <h3 className="font-bold">Cómo enseña</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-600">
              {profile.methodology}
            </p>
            <h3 className="font-bold">Opiniones · {rating(profile)}</h3>
            {reviews(profile).length ? (
              reviews(profile).map((r) => (
                <div key={r.booking_id} className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-bold">
                    {r.author_name} · {r.rating}/5
                  </p>
                  <p className="mt-1 break-words text-sm">{r.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Aún no tiene reseñas.</p>
            )}
            <button
              disabled={busy || !freeSlots(data, profile.user_id).length}
              onClick={() => open(profile)}
              className={`${primary} w-full`}
            >
              Reservar asesoría
            </button>
          </div>
        </DemoModal>
      )}
      {selected && (
        <DemoModal
          title="Reservar asesoría"
          onClose={() => !busy && setSelected(null)}
        >
          <form
            className="space-y-4 p-6 pt-10"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!target) return;
              if (!confirm) {
                setConfirm(true);
                return;
              }
              if (await mutate("book", { slot_id: slot, course, topic }))
                setSelected(null);
            }}
          >
            <h2 className="text-xl font-bold text-[#003B71]">
              {confirm
                ? "Confirma tu reserva"
                : "Reserva con " + selected.display_name}
            </h2>
            {!confirm ? (
              <>
                <Label title="Curso">
                  <select
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className={field}
                  >
                    {selected.courses.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Label>
                <Label title="Horario disponible">
                  <select
                    required
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className={field}
                  >
                    <option value="">Selecciona un horario</option>
                    {available.map((s) => (
                      <option key={s.id} value={s.id}>
                        {formatDate(s.starts_at)} · {s.modality} · {s.location}
                      </option>
                    ))}
                  </select>
                </Label>
                <Label title="¿Qué tema necesitas reforzar?">
                  <textarea
                    required
                    maxLength={240}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className={field}
                  />
                </Label>
              </>
            ) : (
              <div className="space-y-3 rounded-xl bg-blue-50 p-4 text-sm">
                <p>
                  <strong>Asesor:</strong> {selected.display_name}
                </p>
                <p>
                  <strong>Curso:</strong> {course}
                </p>
                <p>
                  {target
                    ? formatDate(target.starts_at)
                    : "El horario dejó de estar disponible. Vuelve y elige otro."}
                </p>
                <p>
                  {target?.modality} · {target?.location}
                </p>
                <p className="break-words">{topic}</p>
                <p className="font-bold">
                  Total S/{selected.price} · 45 minutos
                </p>
                <p className="text-xs">
                  El pago se coordina con el asesor. La reserva quedará
                  pendiente de su aceptación.
                </p>
              </div>
            )}
            {confirm && (
              <button
                type="button"
                disabled={busy}
                className={secondary}
                onClick={() => setConfirm(false)}
              >
                Volver
              </button>
            )}
            <button
              disabled={busy || !target || !topic.trim()}
              className={`${primary} w-full`}
            >
              {busy
                ? "Guardando…"
                : confirm
                  ? "Confirmar reserva"
                  : "Ver resumen"}
            </button>
          </form>
        </DemoModal>
      )}
    </>
  );
}

function BookingList({
  data,
  busy,
  mutate,
  calendar = false,
}: {
  data: Data;
  busy: boolean;
  mutate: Mutate;
  calendar?: boolean;
}) {
  const advisor = data.profile.role === "advisor";
  const [status, setStatus] = useState("");
  const [change, setChange] = useState<Booking | null>(null);
  const [newSlot, setNewSlot] = useState("");
  const [review, setReview] = useState<Booking | null>(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const list = data.bookings.filter((b) =>
    calendar
      ? b.status === "Confirmada" && !ended(b)
      : !status || b.status === status,
  );
  const choices = change ? freeSlots(data, change.advisor_id, change.id) : [];
  return (
    <>
      {!calendar && (
        <select
          aria-label="Filtrar reservas por estado"
          className={`${field} sm:max-w-xs`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {["Pendiente", "Confirmada", "Realizada", "Cancelada"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      )}
      {!list.length ? (
        <p className={`${panel} py-10 text-center text-gray-500`}>
          No hay asesorías para mostrar.
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {list.map((b) => {
            const proposed = data.slots.find(
              (s) => s.id === b.proposed_slot_id,
            );
            const ownReview = data.reviews.find((r) => r.booking_id === b.id);
            return (
              <article key={b.id} className={panel}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-bold text-[#1E3A8A]">{b.course}</h2>
                    <p className="text-sm text-gray-600">
                      {advisor ? b.student_name : b.advisor_name}
                    </p>
                  </div>
                  <Status>{b.status}</Status>
                </div>
                <div className="my-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                  <p>{formatDate(b.starts_at)} · 45 min</p>
                  <p>
                    {b.modality} · {b.location}
                  </p>
                  <p className="font-bold">S/{b.price}</p>
                </div>
                <p className="break-words text-sm text-gray-600">
                  <strong>Consulta:</strong> {b.topic}
                </p>
                {b.notice && (
                  <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs text-blue-800">
                    {b.notice}
                  </p>
                )}
                {b.proposed_slot_id && (
                  <div className="mt-4 space-y-3 rounded-xl bg-purple-50 p-3">
                    <p className="text-xs font-bold text-purple-900">
                      Cambio solicitado:{" "}
                      {proposed
                        ? `${formatDate(proposed.starts_at)} · ${proposed.modality} · ${proposed.location}`
                        : "El horario ya no está publicado"}
                    </p>
                    <p className="text-xs text-purple-800">
                      La fecha original se mantiene hasta aceptar. La propuesta
                      no bloquea el nuevo horario.
                    </p>
                    {advisor ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={busy || !proposed}
                          onClick={() =>
                            void mutate("accept_change", { id: b.id })
                          }
                          className={primary}
                        >
                          Aceptar cambio
                        </button>
                        <button
                          disabled={busy}
                          onClick={() =>
                            void mutate("reject_change", { id: b.id })
                          }
                          className={secondary}
                        >
                          Rechazar cambio
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={busy}
                        onClick={() => void mutate("withdraw", { id: b.id })}
                        className={secondary}
                      >
                        Retirar propuesta
                      </button>
                    )}
                  </div>
                )}
                {!calendar && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {b.status === "Pendiente" && (
                      <>
                        {advisor && (
                          <button
                            disabled={busy}
                            className={primary}
                            onClick={() => void mutate("confirm", { id: b.id })}
                          >
                            Aceptar
                          </button>
                        )}
                        <button
                          disabled={busy}
                          className={secondary}
                          onClick={() => void mutate("cancel", { id: b.id })}
                        >
                          {advisor ? "Rechazar" : "Cancelar"}
                        </button>
                      </>
                    )}
                    {b.status === "Confirmada" && advisor && (
                      <button
                        title={
                          !ended(b)
                            ? "Se habilita al finalizar la sesión"
                            : "Marcar realizada"
                        }
                        disabled={busy || !ended(b) || !!b.proposed_slot_id}
                        className={primary}
                        onClick={() => void mutate("complete", { id: b.id })}
                      >
                        Marcar realizada
                      </button>
                    )}
                    {b.status === "Confirmada" &&
                      !advisor &&
                      !b.proposed_slot_id && (
                        <button
                          disabled={busy}
                          className={secondary}
                          onClick={() => {
                            setChange(b);
                            setNewSlot("");
                          }}
                        >
                          Reprogramar
                        </button>
                      )}
                    {b.status === "Realizada" && !advisor && !ownReview && (
                      <button
                        disabled={busy}
                        className={primary}
                        onClick={() => {
                          setReview(b);
                          setRating("5");
                          setComment("");
                        }}
                      >
                        Dejar reseña
                      </button>
                    )}
                  </div>
                )}
                {ownReview && (
                  <div className="mt-4 rounded-xl bg-amber-50 p-3">
                    <p className="text-xs font-bold text-amber-800">
                      Reseña · {ownReview.rating}/5
                    </p>
                    <p className="mt-1 break-words text-sm text-gray-600">
                      {ownReview.comment}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      {change && (
        <DemoModal
          title="Solicitar reprogramación"
          onClose={() => !busy && setChange(null)}
        >
          <form
            className="space-y-4 p-6 pt-10"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await mutate("propose", { id: change.id, slot_id: newSlot }))
                setChange(null);
            }}
          >
            <h2 className="text-lg font-bold">Elige otro horario</h2>
            <p className="text-sm text-gray-500">
              Se mantendrá tu horario actual hasta que el asesor acepte.
            </p>
            {choices.length ? (
              <Label title="Nuevo horario">
                <select
                  required
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className={field}
                >
                  <option value="">Selecciona una opción</option>
                  {choices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {formatDate(s.starts_at)} · {s.modality} · {s.location}
                    </option>
                  ))}
                </select>
              </Label>
            ) : (
              <p className="text-sm text-amber-800">
                No hay otros horarios publicados. Inténtalo cuando el asesor
                agregue más.
              </p>
            )}
            <button disabled={busy || !newSlot} className={`${primary} w-full`}>
              Enviar propuesta
            </button>
          </form>
        </DemoModal>
      )}
      {review && (
        <DemoModal
          title="Calificar asesoría"
          onClose={() => !busy && setReview(null)}
        >
          <form
            className="space-y-4 p-6 pt-10"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await mutate("review", {
                  id: review.id,
                  rating: Number(rating),
                  comment,
                })
              )
                setReview(null);
            }}
          >
            <h2 className="text-lg font-bold">¿Cómo fue tu asesoría?</h2>
            <Label title="Calificación">
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className={field}
              >
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>
                    {v} estrellas
                  </option>
                ))}
              </select>
            </Label>
            <Label title="Comentario">
              <textarea
                required
                maxLength={300}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={field}
              />
            </Label>
            <button
              disabled={busy || !comment.trim()}
              className={`${primary} w-full`}
            >
              Publicar reseña
            </button>
          </form>
        </DemoModal>
      )}
    </>
  );
}

function Availability({
  data,
  busy,
  mutate,
}: {
  data: Data;
  busy: boolean;
  mutate: Mutate;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [modality, setModality] = useState("Virtual");
  const [location, setLocation] = useState("");
  const slots = data.slots.filter(
    (s) =>
      s.advisor_id === data.profile.user_id &&
      s.active &&
      new Date(s.starts_at).getTime() > Date.now(),
  );
  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <form
        className={`${panel} h-fit space-y-4`}
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await mutate("slot_add", {
              starts_at: `${date}T${time}:00-05:00`,
              modality,
              location,
            })
          ) {
            setDate("");
            setTime("");
          }
        }}
      >
        <h2 className="font-bold">Publicar horario</h2>
        <p className="text-xs text-gray-500">
          Completa primero tus cursos en Mi perfil. Todas las sesiones duran 45
          minutos.
        </p>
        <Label title="Fecha">
          <input
            required
            type="date"
            min={todayLima()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={field}
          />
        </Label>
        <Label title="Hora de Lima">
          <input
            required
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={field}
          />
        </Label>
        <Label title="Modalidad">
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className={field}
          >
            <option>Virtual</option>
            <option>Presencial</option>
          </select>
        </Label>
        <Label
          title={
            modality === "Virtual"
              ? "Cómo se coordinará la sesión"
              : "Lugar de encuentro"
          }
        >
          <input
            required
            minLength={2}
            maxLength={200}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={
              modality === "Virtual"
                ? "Enlace por coordinar"
                : "Indica un lugar acordado"
            }
            className={field}
          />
        </Label>
        <button disabled={busy} className={`${primary} w-full`}>
          Agregar horario
        </button>
      </form>
      <section className="space-y-3">
        <h2 className="font-bold">Mis próximos horarios</h2>
        {slots.length ? (
          slots.map((s) => {
            const occupied = data.bookings.some(
              (b) =>
                b.slot_id === s.id &&
                ["Pendiente", "Confirmada"].includes(b.status),
            );
            return (
              <div
                key={s.id}
                className={`${panel} flex flex-wrap items-center justify-between gap-3`}
              >
                <div>
                  <p className="font-bold text-blue-900">
                    {formatDate(s.starts_at)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {s.modality} · {s.location}
                  </p>
                  {occupied && <Status>Reservado</Status>}
                </div>
                <button
                  disabled={busy || occupied}
                  className={secondary}
                  onClick={() => void mutate("slot_remove", { id: s.id })}
                >
                  Eliminar
                </button>
              </div>
            );
          })
        ) : (
          <p className={`${panel} text-sm text-gray-500`}>
            Todavía no tienes horarios futuros publicados.
          </p>
        )}
      </section>
    </div>
  );
}

function AdvisorProfile({
  advisor,
  busy,
  mutate,
}: {
  advisor: Advisor;
  busy: boolean;
  mutate: Mutate;
}) {
  const [specialty, setSpecialty] = useState(advisor?.specialty ?? "");
  const [courses, setCourses] = useState(advisor?.courses.join("\n") ?? "");
  const [price, setPrice] = useState(String(advisor?.price ?? 30));
  const [method, setMethod] = useState(advisor?.methodology ?? "");
  return (
    <form
      className={`${panel} max-w-2xl space-y-5`}
      onSubmit={async (e) => {
        e.preventDefault();
        await mutate("profile", {
          specialty,
          courses: courses
            .split("\n")
            .map((c) => c.trim())
            .filter(Boolean),
          price: Number(price),
          methodology: method,
        });
      }}
    >
      <h2 className="text-lg font-bold">Tu perfil público</h2>
      <p className="text-sm text-gray-500">
        Al completar tus cursos aparecerás en el buscador. Publica horarios para
        que puedan reservarte.
      </p>
      <Label title="Carrera o especialidad">
        <input
          required
          minLength={2}
          maxLength={100}
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className={field}
        />
      </Label>
      <Label title="Cursos que enseñas (uno por línea)">
        <textarea
          required
          rows={4}
          value={courses}
          onChange={(e) => setCourses(e.target.value)}
          className={field}
        />
      </Label>
      <Label title="Precio por sesión de 45 minutos (S/25–35)">
        <input
          required
          type="number"
          min={25}
          max={35}
          step="0.50"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={field}
        />
      </Label>
      <Label title="Describe cómo enseñas">
        <textarea
          required
          minLength={10}
          maxLength={1500}
          rows={4}
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className={field}
        />
      </Label>
      <button disabled={busy} className={primary}>
        Guardar perfil
      </button>
    </form>
  );
}

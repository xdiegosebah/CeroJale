import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  User,
} from "lucide-react";
import type { AvailabilitySlot, Booking } from "../../App";
import { slotIsAvailable } from "../../bookingRules";
import { DemoModal } from "../DemoModal";
import {
  ADVISORS,
  advisorRating,
  advisorReviews,
  matchesAdvisorCourse,
  normalize,
  type Advisor,
} from "../../advisors";
import { advisorPhotos } from "../../advisorPhotos";

interface Props {
  bookings: Booking[];
  slots: AvailabilitySlot[];
  onBook: (booking: Omit<Booking, "id" | "status" | "createdAt">) => {
    ok: boolean;
    message: string;
  };
}

export function EnrollmentView({ bookings, slots, onBook }: Props) {
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("Todos");
  const [modality, setModality] = useState("Todas");
  const [profile, setProfile] = useState<Advisor | null>(null);
  const [bookingAdvisor, setBookingAdvisor] = useState<Advisor | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [topic, setTopic] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  const availableSlots = slots.filter((slot) =>
    slotIsAvailable(slot, bookings),
  );
  const matchingSlots = (advisorId: string) =>
    availableSlots
      .filter(
        (slot) =>
          slot.advisorId === advisorId &&
          (modality === "Todas" || slot.modality === modality),
      )
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const advisorSlots = bookingAdvisor ? matchingSlots(bookingAdvisor.id) : [];
  const availableDates = [...new Set(advisorSlots.map((slot) => slot.date))];
  const dateSlots = advisorSlots.filter((slot) => slot.date === selectedDate);

  const filtered = ADVISORS.filter((advisor) => {
    const matchesCourse = matchesAdvisorCourse(advisor, search);
    const matchesPrice =
      maxPrice === "Todos" || advisor.price <= Number(maxPrice);
    const matchesModality =
      modality === "Todas" || matchingSlots(advisor.id).length > 0;
    return matchesCourse && matchesPrice && matchesModality;
  });

  const openBooking = (advisor: Advisor) => {
    setBookingAdvisor(advisor);
    setSelectedCourse(
      advisor.courses.find((course) =>
        normalize(course).includes(normalize(search)),
      ) ?? advisor.course,
    );
    setSelectedDate("");
    setSelectedSlot(null);
    setTopic("");
    setConfirming(false);
    setMessage("");
  };

  const continueToSummary = () => {
    if (
      !selectedCourse ||
      !selectedSlot ||
      !advisorSlots.some((slot) => slot.id === selectedSlot.id) ||
      !topic.trim()
    ) {
      setMessage(
        "Selecciona una fecha, un horario y cuéntanos qué tema necesitas reforzar.",
      );
      return;
    }
    setMessage("");
    setConfirming(true);
  };

  const confirm = () => {
    if (!bookingAdvisor || !selectedSlot) return;
    const result = onBook({
      studentName: "Carlos Andrade",
      advisorId: bookingAdvisor.id,
      advisorName: bookingAdvisor.name,
      course: selectedCourse,
      date: selectedSlot.date,
      time: selectedSlot.time,
      modality: selectedSlot.modality,
      location: selectedSlot.location,
      duration: bookingAdvisor.duration,
      price: bookingAdvisor.price,
      topic: topic.trim(),
    });
    if (result.ok) {
      setBookingAdvisor(null);
      setMessage("");
      window.setTimeout(() => setMessage(""), 5000);
    } else {
      setConfirming(false);
      setSelectedSlot(null);
    }
    setMessage(result.message);
  };

  return (
    <div className="space-y-6">
      {message && !bookingAdvisor && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
        >
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}
      <p className="text-xs text-gray-500">
        Perfiles, fotos y reseñas de ejemplo. Todas las asesorías duran 45
        minutos; no se realizan cobros.
      </p>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_190px]">
          <label className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              aria-label="Buscar por nombre del curso"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre del curso..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3">
            <SlidersHorizontal size={15} className="text-[#1E3A8A]" />
            <select
              aria-label="Precio máximo"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-transparent py-2.5 text-sm outline-none"
            >
              <option value="Todos">Cualquier precio</option>
              <option value="25">Hasta S/25</option>
              <option value="30">Hasta S/30</option>
              <option value="35">Hasta S/35</option>
            </select>
          </label>
          <select
            aria-label="Modalidad"
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none"
          >
            <option value="Todas">Todas las modalidades</option>
            <option>Virtual</option>
            <option>Presencial</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <Search className="mx-auto mb-3 text-gray-300" size={36} />
          <p className="font-semibold text-gray-600">
            No encontramos asesorías con esos filtros.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setMaxPrice("Todos");
              setModality("Todas");
            }}
            className="mt-3 text-sm font-semibold text-blue-700"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((advisor) => {
            const nextSlot = matchingSlots(advisor.id)[0];
            const publishedModalities = [
              ...new Set(
                slots
                  .filter((slot) => slot.advisorId === advisor.id)
                  .map((slot) => slot.modality),
              ),
            ];
            return (
              <article
                key={advisor.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="h-1.5 bg-gradient-to-r from-[#003B71] via-[#0072CE] to-[#28E87C]" />
                <div className="flex-1 p-5">
                  <div className="flex items-start gap-3">
                    <img
                      src={advisorPhotos[advisor.id]}
                      alt={advisor.name}
                      className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-gray-900">
                        {advisor.name}
                      </h3>
                      <p className="truncate text-xs text-gray-500">
                        {advisor.specialty}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Star size={13} fill="currentColor" />
                        {advisorRating(advisor, bookings)}{" "}
                        <span className="font-normal text-gray-400">
                          · {advisorReviews(advisor, bookings).length} reseñas ·
                          Demo
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-[#1E3A8A]">
                      {advisor.courses.join(" · ")}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {advisor.duration} min
                      </span>
                      <span className="font-bold text-[#1E3A8A]">
                        S/{advisor.price} total
                      </span>
                      <span className="col-span-2 flex items-center gap-1.5">
                        <MapPin size={14} />
                        {publishedModalities.join(" / ") ||
                          "Sin disponibilidad publicada"}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`mt-3 text-xs font-semibold ${nextSlot ? "text-emerald-700" : "text-gray-400"}`}
                  >
                    {nextSlot
                      ? `Próximo: ${new Date(`${nextSlot.date}T12:00:00`).toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" })} · ${nextSlot.time}`
                      : "Sin horarios disponibles"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-gray-100 p-4">
                  <button
                    onClick={() => setProfile(advisor)}
                    className="rounded-xl border border-blue-200 py-2.5 text-xs font-bold text-[#1E3A8A]"
                  >
                    Ver perfil
                  </button>
                  <button
                    disabled={!nextSlot}
                    onClick={() => openBooking(advisor)}
                    className="rounded-xl bg-[#1E3A8A] py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Reservar asesoría
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {profile && (
        <DemoModal
          title={`Perfil de ${profile.name}`}
          onClose={() => setProfile(null)}
        >
          <div className="bg-gradient-to-r from-[#003B71] to-[#0072CE] p-6 text-white">
            <div className="flex items-center gap-4 pr-4">
              <img
                src={advisorPhotos[profile.id]}
                alt={profile.name}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-white/20"
              />
              <div>
                <p className="mb-1 inline-block rounded-full bg-[#28E87C] px-2 py-0.5 text-[10px] font-black uppercase text-[#003B71]">
                  Perfil de demostración
                </p>
                <h2 className="text-xl font-black">{profile.name}</h2>
                <p className="text-sm text-blue-100">{profile.specialty}</p>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-6">
            <section>
              <h3 className="mb-2 text-sm font-bold text-gray-900">
                Cursos que enseña
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.courses.map((course) => (
                  <span
                    key={course}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-1 text-sm font-bold text-gray-900">
                Metodología
              </h3>
              <p className="text-sm leading-6 text-gray-600">
                {profile.methodology}
              </p>
            </section>
            <section>
              <h3 className="mb-2 text-sm font-bold text-gray-900">
                Reseñas · {advisorRating(profile, bookings)}/5
              </h3>
              <div className="space-y-2">
                {advisorReviews(profile, bookings).map((review) => (
                  <div key={review.id} className="rounded-xl bg-gray-50 p-3">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold">
                        {review.author} ·{" "}
                        {review.example
                          ? "Ejemplo ficticio"
                          : "Sesión realizada en este prototipo"}
                      </span>
                      <span className="text-xs text-amber-500">
                        {"★".repeat(review.rating)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </section>
            <button
              disabled={matchingSlots(profile.id).length === 0}
              onClick={() => {
                setProfile(null);
                openBooking(profile);
              }}
              className="w-full rounded-xl bg-[#1E3A8A] py-3 text-sm font-bold text-white disabled:bg-gray-300"
            >
              {matchingSlots(profile.id).length
                ? "Reservar asesoría"
                : "Sin horarios disponibles"}
            </button>
          </div>
        </DemoModal>
      )}

      {bookingAdvisor && (
        <DemoModal
          title={`Reservar ${selectedCourse}`}
          onClose={() => setBookingAdvisor(null)}
        >
          <div className="border-b border-gray-100 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {confirming ? "Revisa antes de confirmar" : "Nueva reserva"}
            </p>
            <h2 className="text-xl font-black text-[#003B71]">
              {selectedCourse}
            </h2>
            <p className="text-sm text-gray-500">con {bookingAdvisor.name}</p>
          </div>
          {!confirming ? (
            <div className="space-y-5 p-6">
              <label className="block text-xs font-bold text-gray-700">
                Curso a reservar
                <select
                  aria-label="Curso a reservar"
                  value={selectedCourse}
                  onChange={(event) => setSelectedCourse(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm"
                >
                  {bookingAdvisor.courses.map((course) => (
                    <option key={course}>{course}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold text-gray-700">
                Fecha disponible
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"
                >
                  <option value="">Selecciona una fecha</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(`${date}T12:00:00`).toLocaleDateString(
                        "es-PE",
                        { weekday: "long", day: "numeric", month: "long" },
                      )}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <p className="mb-2 text-xs font-bold text-gray-700">
                  Horario y modalidad
                </p>
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-2">
                    {dateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-xl border-2 p-3 text-left text-xs ${selectedSlot?.id === slot.id ? "border-blue-600 bg-blue-50 text-blue-800" : "border-gray-200"}`}
                      >
                        <span className="block font-bold">
                          {slot.time} · {slot.modality}
                        </span>
                        <span className="mt-1 block text-gray-500">
                          {slot.location}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-400">
                    Primero selecciona una fecha.
                  </p>
                )}
              </div>
              <label className="block text-xs font-bold text-gray-700">
                ¿Qué tema necesitas reforzar? *
                <textarea
                  required
                  maxLength={240}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej.: límites laterales y ejercicios para el parcial"
                  className="mt-2 min-h-24 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              {message && (
                <p
                  role="alert"
                  className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700"
                >
                  {message}
                </p>
              )}
              <button
                onClick={continueToSummary}
                className="w-full rounded-xl bg-[#1E3A8A] py-3 text-sm font-bold text-white"
              >
                Ver resumen
              </button>
            </div>
          ) : (
            selectedSlot && (
              <div className="space-y-4 p-6">
                <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
                  <Summary
                    label="Asesor"
                    value={bookingAdvisor.name}
                    icon={<User size={15} />}
                  />
                  <Summary label="Curso" value={selectedCourse} />
                  <Summary
                    label="Fecha"
                    value={new Date(
                      `${selectedSlot.date}T12:00:00`,
                    ).toLocaleDateString("es-PE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    icon={<Calendar size={15} />}
                  />
                  <Summary
                    label="Hora y modalidad"
                    value={`${selectedSlot.time} · ${selectedSlot.modality}`}
                    icon={<Clock size={15} />}
                  />
                  <Summary
                    label="Duración"
                    value={`${bookingAdvisor.duration} minutos`}
                  />
                  <Summary
                    label="Precio total"
                    value={`S/${bookingAdvisor.price}`}
                  />
                </div>
                <div className="rounded-xl border border-blue-100 p-3">
                  <p className="text-xs font-bold text-gray-700">
                    Tema a reforzar
                  </p>
                  <p className="mt-1 break-words text-sm text-gray-600">
                    {topic}
                  </p>
                </div>
                <p className="text-[11px] text-gray-400">
                  Prototipo: no se realizará ningún cobro ni procesamiento de
                  pago.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfirming(false)}
                    className="rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600"
                  >
                    Volver
                  </button>
                  <button
                    onClick={confirm}
                    className="rounded-xl bg-[#1E3A8A] py-3 text-sm font-bold text-white"
                  >
                    Confirmar reserva
                  </button>
                </div>
              </div>
            )
          )}
        </DemoModal>
      )}
    </div>
  );
}

function Summary({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-1.5 text-gray-500">
        {icon}
        {label}
      </span>
      <span className="text-right font-bold text-gray-900">{value}</span>
    </div>
  );
}

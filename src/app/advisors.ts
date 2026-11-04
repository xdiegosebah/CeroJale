import type { Booking } from "./App";

export interface Advisor {
  id: string;
  name: string;
  specialty: string;
  course: string;
  courses: string[];
  price: number;
  duration: number;
  modalities: ("Virtual" | "Presencial")[];
  photo: string;
  methodology: string;
  rating: number;
  reviews: { author: string; rating: number; text: string }[];
}

export const ADVISORS: Advisor[] = [
  {
    id: "roberto",
    name: "Roberto Martínez",
    specialty: "Ingeniería y Matemáticas",
    course: "Cálculo Diferencial",
    courses: ["Cálculo Diferencial", "Álgebra Lineal"],
    price: 30,
    duration: 45,
    modalities: ["Virtual", "Presencial"],
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&auto=format",
    methodology:
      "Primero identificamos la duda, resolvemos un ejemplo guiado y cerramos con un ejercicio corto para comprobar lo aprendido.",
    rating: 4.9,
    reviews: [
      {
        author: "Andrea M.",
        rating: 5,
        text: "Explica paso a paso y resuelve dudas con paciencia.",
      },
      {
        author: "Luis P.",
        rating: 5,
        text: "La práctica final me ayudó a entender límites.",
      },
    ],
  },
  {
    id: "ana",
    name: "Ana Flores",
    specialty: "Ciencias de la Computación",
    course: "Fundamentos de Programación",
    courses: [
      "Fundamentos de Programación",
      "Programación Orientada a Objetos",
    ],
    price: 35,
    duration: 45,
    modalities: ["Virtual", "Presencial"],
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&auto=format",
    methodology:
      "Trabajamos con ejercicios breves, trazas de código y retroalimentación inmediata.",
    rating: 4.8,
    reviews: [
      {
        author: "Marco R.",
        rating: 5,
        text: "Los ejemplos fueron claros y muy prácticos.",
      },
    ],
  },
  {
    id: "carlos",
    name: "Carlos Mendoza",
    specialty: "Matemática Aplicada",
    course: "Álgebra Lineal",
    courses: ["Álgebra Lineal", "Matemática Básica"],
    price: 25,
    duration: 45,
    modalities: ["Virtual"],
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&auto=format",
    methodology:
      "Conectamos conceptos visuales con procedimientos de examen y práctica autónoma.",
    rating: 4.7,
    reviews: [
      {
        author: "Sofía T.",
        rating: 4,
        text: "Buen ritmo y material ordenado.",
      },
    ],
  },
  {
    id: "diana",
    name: "Diana Torres",
    specialty: "Física Aplicada",
    course: "Física General I",
    courses: ["Física General I", "Física General II"],
    price: 32,
    duration: 45,
    modalities: ["Presencial"],
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&auto=format",
    methodology:
      "Partimos de situaciones reales para plantear diagramas y resolver problemas.",
    rating: 4.9,
    reviews: [
      {
        author: "Diego C.",
        rating: 5,
        text: "Ahora entiendo mejor los diagramas de cuerpo libre.",
      },
    ],
  },
  {
    id: "patricia",
    name: "Patricia Vega",
    specialty: "Estadística y Probabilidad",
    course: "Estadística Descriptiva",
    courses: ["Estadística Descriptiva", "Probabilidad"],
    price: 28,
    duration: 45,
    modalities: ["Virtual"],
    photo:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&auto=format",
    methodology:
      "Interpretamos datos antes de aplicar fórmulas y practicamos con casos académicos.",
    rating: 4.8,
    reviews: [
      {
        author: "Valeria S.",
        rating: 5,
        text: "Muy buena explicación de gráficos y medidas.",
      },
    ],
  },
  {
    id: "miguel",
    name: "Miguel Rojas",
    specialty: "Ingeniería Industrial",
    course: "Investigación de Operaciones",
    courses: ["Investigación de Operaciones", "Procesos"],
    price: 30,
    duration: 45,
    modalities: ["Presencial"],
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&auto=format",
    methodology:
      "Modelamos el problema, revisamos restricciones y validamos juntos la solución.",
    rating: 4.7,
    reviews: [
      {
        author: "Renato A.",
        rating: 5,
        text: "La sesión fue ordenada y resolvió mi caso.",
      },
    ],
  },
];

export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function matchesAdvisorCourse(advisor: Advisor, search: string) {
  return advisor.courses.some((course) =>
    normalize(course).includes(normalize(search)),
  );
}

export function advisorReviews(advisor: Advisor, bookings: Booking[]) {
  // Examples remain explicitly labelled and participate in the displayed average.
  return [
    ...advisor.reviews.map((review, index) => ({
      ...review,
      id: `example-${index}`,
      example: true,
    })),
    ...bookings
      .filter(
        (booking) =>
          booking.advisorId === advisor.id &&
          booking.status === "Realizada" &&
          booking.review,
      )
      .map((booking) => ({
        id: booking.id,
        author: booking.studentName,
        rating: booking.review!.rating,
        text: booking.review!.comment,
        example: false,
      })),
  ];
}

export function advisorRating(advisor: Advisor, bookings: Booking[]) {
  const reviews = advisorReviews(advisor, bookings);
  return reviews.length
    ? (
        reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      ).toFixed(1)
    : "Sin reseñas";
}

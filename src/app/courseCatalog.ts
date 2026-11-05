/** Catálogo inicial. Son cursos disponibles para solicitar, sin profesores ficticios. */
export const COURSE_CATALOG = [
  {
    name: "Cálculo Diferencial",
    price: 30,
    modalities: ["Virtual", "Presencial"],
  },
  { name: "Álgebra Lineal", price: 25, modalities: ["Virtual", "Presencial"] },
  {
    name: "Fundamentos de Programación",
    price: 35,
    modalities: ["Virtual", "Presencial"],
  },
  {
    name: "Programación Orientada a Objetos",
    price: 35,
    modalities: ["Virtual", "Presencial"],
  },
  {
    name: "Matemática Básica",
    price: 25,
    modalities: ["Virtual", "Presencial"],
  },
  {
    name: "Física General I",
    price: 32,
    modalities: ["Virtual", "Presencial"],
  },
  {
    name: "Física General II",
    price: 32,
    modalities: ["Virtual", "Presencial"],
  },
  {
    name: "Estadística Descriptiva",
    price: 28,
    modalities: ["Virtual", "Presencial"],
  },
  { name: "Probabilidad", price: 28, modalities: ["Virtual", "Presencial"] },
  {
    name: "Investigación de Operaciones",
    price: 30,
    modalities: ["Virtual", "Presencial"],
  },
  { name: "Procesos", price: 30, modalities: ["Virtual", "Presencial"] },
];
export type CourseOffering = (typeof COURSE_CATALOG)[number];

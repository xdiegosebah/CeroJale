import test from "node:test";
import assert from "node:assert/strict";
import {
  ADVISORS,
  advisorReviews,
  advisorRating,
  matchesAdvisorCourse,
} from "./advisors.ts";
const advisor = ADVISORS[0];
test("el buscador encuentra cursos secundarios sin distinguir tildes ni mayúsculas", () => {
  assert.equal(matchesAdvisorCourse(advisor, "  ALGEBRA  "), true);
  assert.equal(matchesAdvisorCourse(advisor, "calculo"), true);
  assert.equal(matchesAdvisorCourse(advisor, "fisica"), false);
});
test("las reseñas del perfil y su media se derivan de sesiones realizadas", () => {
  const base = advisorReviews(advisor, []);
  const completed = {
    id: "review1",
    advisorId: advisor.id,
    studentName: "Carlos",
    status: "Realizada",
    review: { rating: 1, comment: "Faltaron ejemplos", createdAt: "demo" },
  };
  const other = { ...completed, id: "other", advisorId: "ana" };
  const pending = { ...completed, id: "pending", status: "Pendiente" };
  const reviews = advisorReviews(advisor, [completed, other, pending]);
  assert.equal(reviews.length, base.length + 1);
  assert.equal(reviews.at(-1).text, "Faltaron ejemplos");
  assert.equal(reviews.at(-1).example, false);
  assert.equal(advisorRating(advisor, [completed]), "3.7");
  assert.equal(advisorRating(advisor, []), "5.0");
});

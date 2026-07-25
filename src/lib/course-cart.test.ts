import { describe, expect, it } from "vitest";
import { calculateCourseCart } from "./course-cart";

const courses = Array.from({ length: 4 }, (_, index) => ({
  id: `course-${index + 1}`,
  price_monthly: 650,
}));

describe("calculateCourseCart", () => {
  it.each([
    [1, 650, 0],
    [2, 1000, 300],
    [3, 1650, 300],
    [4, 2000, 600],
  ])(
    "calculates the promotional total for %i course(s)",
    (quantity, total, discount) => {
      expect(calculateCourseCart(courses.slice(0, quantity))).toMatchObject({
        total,
        discount,
        promotionalPairs: Math.floor(quantity / 2),
      });
    },
  );
});

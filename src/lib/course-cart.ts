export const COURSE_CART_STORAGE_KEY = "kingsman-course-cart";
export const PROMOTIONAL_PAIR_PRICE = 1000;

type PricedCourse = {
  id: string;
  price_monthly: number;
};

export function calculateCourseCart<T extends PricedCourse>(courses: T[]) {
  const items = courses.map((course, index) => ({
    ...course,
    chargedPrice: index < courses.length - (courses.length % 2)
      ? PROMOTIONAL_PAIR_PRICE / 2
      : Number(course.price_monthly || 650),
  }));
  const regularTotal = courses.reduce(
    (total, course) => total + Number(course.price_monthly || 650),
    0,
  );
  const total = items.reduce((sum, item) => sum + item.chargedPrice, 0);

  return {
    items,
    regularTotal,
    total,
    discount: Math.max(0, regularTotal - total),
    promotionalPairs: Math.floor(courses.length / 2),
  };
}

export function readCourseCart() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const value = JSON.parse(window.localStorage.getItem(COURSE_CART_STORAGE_KEY) || "[]");
    return Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string"))]
      : [];
  } catch {
    return [];
  }
}

export function writeCourseCart(courseIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    COURSE_CART_STORAGE_KEY,
    JSON.stringify([...new Set(courseIds)]),
  );
}

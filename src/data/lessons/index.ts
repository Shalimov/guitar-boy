import type { Lesson } from "@/types/lesson";
import lesson01 from "./lesson-01";
import lesson02 from "./lesson-02";
import lesson03 from "./lesson-03";
import lesson04 from "./lesson-04";
import lesson05 from "./lesson-05";
import lesson06 from "./lesson-06";
import lesson07 from "./lesson-07";

export const lessons: Lesson[] = [
	lesson01,
	lesson02,
	lesson03,
	lesson04,
	lesson05,
	lesson06,
	lesson07,
];

export function getLessonById(id: string): Lesson | undefined {
	return lessons.find((lesson) => lesson.id === id);
}

export function getLessonsByCategory(category: Lesson["category"]): Lesson[] {
	return lessons.filter((lesson) => lesson.category === category);
}

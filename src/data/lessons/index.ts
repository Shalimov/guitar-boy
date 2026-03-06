import type { Lesson } from "@/types/lesson";
import lesson01 from "./lesson-01";
import lesson02 from "./lesson-02";

export const lessons: Lesson[] = [lesson01, lesson02];

export function getLessonById(id: string): Lesson | undefined {
	return lessons.find((lesson) => lesson.id === id);
}

export function getLessonsByCategory(category: Lesson["category"]): Lesson[] {
	return lessons.filter((lesson) => lesson.category === category);
}

import { useState } from "react";
import { Card } from "@/components/ui";
import { getLessonsByCategory } from "@/data/lessons";
import type { Lesson } from "@/types/lesson";

interface LessonListProps {
	onSelectLesson: (lesson: Lesson) => void;
}

export function LessonList({ onSelectLesson }: LessonListProps) {
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	const categories = ["all", "notes", "intervals", "chords", "patterns"];
	const filteredLessons =
		selectedCategory === "all"
			? getLessonsByCategory("notes")
					.concat(getLessonsByCategory("intervals"))
					.concat(getLessonsByCategory("chords"))
					.concat(getLessonsByCategory("patterns"))
			: getLessonsByCategory(selectedCategory as "notes" | "intervals" | "chords" | "patterns");

	return (
		<div className="space-y-4">
			<div className="flex gap-2 flex-wrap">
				{categories.map((category) => (
					<button
						key={category}
						type="button"
						onClick={() => setSelectedCategory(category)}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							selectedCategory === category
								? "bg-blue-500 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						{category.charAt(0).toUpperCase() + category.slice(1)}
					</button>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{filteredLessons.length === 0 ? (
					<div className="col-span-2 text-center py-8 text-gray-500">
						No lessons available in this category yet.
					</div>
				) : (
					filteredLessons.map((lesson) => (
						<Card key={lesson.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
							<div className="flex justify-between items-start mb-2">
								<h3 className="text-lg font-bold text-gray-900">{lesson.title}</h3>
								<span
									className={`text-xs px-2 py-1 rounded ${
										lesson.difficulty === "beginner"
											? "bg-green-100 text-green-700"
											: lesson.difficulty === "intermediate"
												? "bg-yellow-100 text-yellow-700"
												: "bg-red-100 text-red-700"
									}`}
								>
									{lesson.difficulty}
								</span>
							</div>
							<p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
							<div className="flex justify-between items-center">
								<span className="text-xs text-gray-500">{lesson.steps.length} steps</span>
								<button
									type="button"
									onClick={() => onSelectLesson(lesson)}
									className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
								>
									Start Lesson
								</button>
							</div>
						</Card>
					))
				)}
			</div>
		</div>
	);
}

import { useState } from "react";
import { getLessonsByCategory } from "@/data/lessons";
import type { Lesson } from "@/types/lesson";

interface LessonListProps {
	onSelectLesson: (lesson: Lesson) => void;
}

const DIFFICULTY_STYLES: Record<string, { background: string; color: string }> = {
	beginner: { background: "color-mix(in srgb, #16a34a 15%, var(--gb-bg-elev))", color: "#166534" },
	intermediate: {
		background: "color-mix(in srgb, #ca8a04 15%, var(--gb-bg-elev))",
		color: "#854d0e",
	},
	advanced: { background: "color-mix(in srgb, #dc2626 15%, var(--gb-bg-elev))", color: "#991b1b" },
};

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
		<div className="space-y-5">
			{/* Category filter pills */}
			<div className="flex gap-2 flex-wrap">
				{categories.map((category) => {
					const active = selectedCategory === category;
					return (
						<button
							key={category}
							type="button"
							onClick={() => setSelectedCategory(category)}
							style={
								active
									? {
											background: "var(--gb-accent)",
											color: "#fff8ee",
											borderColor: "var(--gb-accent)",
										}
									: {
											background: "var(--gb-bg-panel)",
											color: "var(--gb-text)",
											borderColor: "var(--gb-border)",
										}
							}
							className="px-4 py-1.5 rounded-full border font-medium text-sm transition-all hover:opacity-90 focus-visible:outline-none"
						>
							{category.charAt(0).toUpperCase() + category.slice(1)}
						</button>
					);
				})}
			</div>

			{/* Lesson cards */}
			<div className="grid gap-4 md:grid-cols-2">
				{filteredLessons.length === 0 ? (
					<div
						className="col-span-2 py-10 text-center text-sm rounded-xl"
						style={{
							background: "var(--gb-bg-panel)",
							color: "var(--gb-text-muted)",
							border: "1px dashed var(--gb-border)",
						}}
					>
						No lessons available in this category yet.
					</div>
				) : (
					filteredLessons.map((lesson) => {
						const diffStyle = DIFFICULTY_STYLES[lesson.difficulty] ?? DIFFICULTY_STYLES.beginner;
						return (
							<div
								key={lesson.id}
								className="rounded-xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5"
								style={{
									background: "var(--gb-bg-elev)",
									border: "1px solid var(--gb-border)",
									boxShadow: "var(--gb-shadow-soft)",
								}}
							>
								<div className="flex justify-between items-start gap-2">
									<h3
										className="font-semibold text-base leading-snug"
										style={{ color: "var(--gb-text)" }}
									>
										{lesson.title}
									</h3>
									<span
										className="shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium"
										style={diffStyle}
									>
										{lesson.difficulty}
									</span>
								</div>

								<p className="text-sm flex-1" style={{ color: "var(--gb-text-muted)" }}>
									{lesson.description}
								</p>

								<div className="flex justify-between items-center">
									<span className="text-xs" style={{ color: "var(--gb-text-muted)" }}>
										{lesson.steps.length} steps
									</span>
									<button
										type="button"
										onClick={() => onSelectLesson(lesson)}
										style={{
											background: "var(--gb-accent)",
											color: "#fff8ee",
											boxShadow: "0 2px 8px rgba(179,93,42,0.28)",
										}}
										className="px-4 py-1.5 rounded-full font-medium text-sm transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none"
									>
										Start Lesson
									</button>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

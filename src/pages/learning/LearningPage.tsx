import { useState } from "react";
import type { Lesson } from "@/types/lesson";
import { LessonList } from "./LessonList";
import { LessonPlayer } from "./LessonPlayer";

export function LearningPage() {
	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
	const [showExplorer, setShowExplorer] = useState(false);

	const handleSelectLesson = (lesson: Lesson) => {
		setSelectedLesson(lesson);
		setShowExplorer(false);
	};

	const handleLessonComplete = () => {
		alert("Lesson completed! Great job!");
		setSelectedLesson(null);
	};

	const handleExitLesson = () => {
		setSelectedLesson(null);
	};

	if (selectedLesson) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<LessonPlayer
					lesson={selectedLesson}
					onComplete={handleLessonComplete}
					onExit={handleExitLesson}
				/>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			{/* Tab bar */}
			<div
				className="flex gap-1 p-1 rounded-xl"
				style={{ background: "var(--gb-bg-panel)", border: "1px solid var(--gb-border)" }}
			>
				{[
					{ label: "Lessons", active: !showExplorer, onClick: () => setShowExplorer(false) },
					{ label: "Explorer", active: showExplorer, onClick: () => setShowExplorer(true) },
				].map(({ label, active, onClick }) => (
					<button
						key={label}
						type="button"
						onClick={onClick}
						style={
							active
								? {
										background: "var(--gb-accent)",
										color: "#fff8ee",
										boxShadow: "0 2px 8px rgba(179,93,42,0.3)",
									}
								: { color: "var(--gb-text-muted)" }
						}
						className="flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all"
					>
						{label}
					</button>
				))}
			</div>

			{/* Content */}
			{!showExplorer ? (
				<div className="gb-panel p-7 space-y-5">
					<div>
						<p className="gb-page-kicker mb-1">Learn</p>
						<h1 className="gb-page-title">Guided Lessons</h1>
						<p className="text-sm mt-2" style={{ color: "var(--gb-text-muted)" }}>
							Structured lessons to help you learn note positions, intervals, and chords on the
							fretboard.
						</p>
					</div>
					<LessonList onSelectLesson={handleSelectLesson} />
				</div>
			) : (
				<div className="gb-panel p-7 space-y-5">
					<div>
						<p className="gb-page-kicker mb-1">Explore</p>
						<h1 className="gb-page-title">Fretboard Explorer</h1>
						<p className="text-sm mt-2" style={{ color: "var(--gb-text-muted)" }}>
							Interactive reference view to explore notes, intervals, and patterns on the fretboard.
						</p>
					</div>
					<div
						className="rounded-xl p-8 text-center text-sm"
						style={{
							background: "var(--gb-bg-panel)",
							border: "1px dashed var(--gb-border)",
							color: "var(--gb-text-muted)",
						}}
					>
						Explorer mode coming soon! This will allow you to interactively explore the fretboard.
					</div>
				</div>
			)}
		</div>
	);
}

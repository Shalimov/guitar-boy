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
		<div className="max-w-6xl mx-auto p-6">
			<div className="mb-6">
				<div className="flex gap-4 border-b border-gray-200">
					<button
						type="button"
						onClick={() => setShowExplorer(false)}
						className={`px-6 py-3 font-medium transition-colors ${
							!showExplorer
								? "text-blue-600 border-b-2 border-blue-600"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						Lessons
					</button>
					<button
						type="button"
						onClick={() => setShowExplorer(true)}
						className={`px-6 py-3 font-medium transition-colors ${
							showExplorer
								? "text-blue-600 border-b-2 border-blue-600"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						Explorer
					</button>
				</div>
			</div>

			{!showExplorer ? (
				<div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Guided Lessons</h1>
					<p className="text-gray-600 mb-6">
						Structured lessons to help you learn note positions, intervals, and chords on the
						fretboard.
					</p>
					<LessonList onSelectLesson={handleSelectLesson} />
				</div>
			) : (
				<div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Fretboard Explorer</h1>
					<p className="text-gray-600 mb-6">
						Interactive reference view to explore notes, intervals, and patterns on the fretboard.
					</p>
					<div className="p-8 bg-gray-50 rounded-lg text-center text-gray-500">
						Explorer mode coming soon! This will allow you to interactively explore the fretboard.
					</div>
				</div>
			)}
		</div>
	);
}

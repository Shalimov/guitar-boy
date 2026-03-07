import { useState } from "react";
import type { Lesson } from "@/types/lesson";
import { ExplorerPanel } from "./ExplorerPanel";
import { LessonList } from "./LessonList";
import { LessonPlayer } from "./LessonPlayer";
import { NoteMemoryTrainer } from "./NoteMemoryTrainer";

type LearningTab = "lessons" | "trainer" | "explorer";

export function LearningPage() {
	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
	const [activeTab, setActiveTab] = useState<LearningTab>("lessons");

	const handleSelectLesson = (lesson: Lesson) => {
		setSelectedLesson(lesson);
		setActiveTab("lessons");
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
		<div className={`${activeTab === "explorer" ? "w-full" : "max-w-5xl mx-auto"} p-6 space-y-6`}>
			{/* Tab bar */}
			<div
				className="flex gap-1 p-1 rounded-xl"
				style={{ background: "var(--gb-bg-panel)", border: "1px solid var(--gb-border)" }}
			>
				{[
					{
						label: "Lessons",
						active: activeTab === "lessons",
						onClick: () => setActiveTab("lessons"),
					},
					{
						label: "Trainer",
						active: activeTab === "trainer",
						onClick: () => setActiveTab("trainer"),
					},
					{
						label: "Explorer",
						active: activeTab === "explorer",
						onClick: () => setActiveTab("explorer"),
					},
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
			{activeTab === "lessons" ? (
				<div className="gb-panel p-7 space-y-5">
					<div>
						<p className="gb-page-kicker mb-1">Learn</p>
						<h1 className="gb-page-title">Guided Lessons</h1>
						<p className="text-sm mt-2" style={{ color: "var(--gb-text-muted)" }}>
							Structured lessons to help you learn note positions, intervals, and chords on the
							fretboard, now with playable note examples for ear-and-eye practice.
						</p>
					</div>
					<LessonList onSelectLesson={handleSelectLesson} />
				</div>
			) : activeTab === "trainer" ? (
				<div className="gb-panel p-7 space-y-5">
					<div>
						<p className="gb-page-kicker mb-1">Practice</p>
						<h1 className="gb-page-title">Note Memory Trainer</h1>
						<p className="text-sm mt-2" style={{ color: "var(--gb-text-muted)" }}>
							Use short visual and ear-first drills to connect note names, fretboard locations, and
							pitch faster.
						</p>
					</div>
					<NoteMemoryTrainer />
				</div>
			) : (
				<div className="gb-panel p-7 space-y-5">
					<div>
						<p className="gb-page-kicker mb-1">Explore</p>
						<h1 className="gb-page-title">Fretboard Explorer</h1>
						<p className="text-sm mt-2" style={{ color: "var(--gb-text-muted)" }}>
							Interactive theory lab for mapping scales, chords, arpeggios, and interval shapes
							across the neck.
						</p>
					</div>
					<ExplorerPanel />
				</div>
			)}
		</div>
	);
}

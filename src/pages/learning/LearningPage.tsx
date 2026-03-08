import { useState } from "react";
import { ConfirmDialog, PageHeader, TabBar } from "@/components/ui";
import type { Lesson } from "@/types/lesson";
import { ExplorerPanel } from "./ExplorerPanel";
import { LessonList } from "./LessonList";
import { LessonPlayer } from "./LessonPlayer";
import { NoteMemoryTrainer } from "./NoteMemoryTrainer";

type LearningTab = "lessons" | "trainer" | "explorer";

const TABS: { label: LearningTab; labelText: string }[] = [
	{ label: "lessons", labelText: "Lessons" },
	{ label: "trainer", labelText: "Trainer" },
	{ label: "explorer", labelText: "Explorer" },
];

export function LearningPage() {
	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
	const [activeTab, setActiveTab] = useState<LearningTab>("lessons");
	const [showCompleteDialog, setShowCompleteDialog] = useState(false);

	const handleSelectLesson = (lesson: Lesson) => {
		setSelectedLesson(lesson);
		setActiveTab("lessons");
	};

	const handleLessonComplete = () => {
		setShowCompleteDialog(true);
	};

	const handleExitLesson = () => {
		setSelectedLesson(null);
	};

	const handleCompleteDialogClose = () => {
		setShowCompleteDialog(false);
		setSelectedLesson(null);
	};

	const tabs = TABS.map((t) => ({
		label: t.labelText,
		active: activeTab === t.label,
		onClick: () => setActiveTab(t.label),
	}));

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
			<TabBar tabs={tabs} />

			{/* Content */}
			{activeTab === "lessons" ? (
				<div className="gb-panel p-7 space-y-5">
					<PageHeader
						kicker="Learn"
						title="Guided Lessons"
						description="Structured lessons to help you learn note positions, intervals, and chords on the fretboard, now with playable note examples for ear-and-eye practice."
					/>
					<LessonList onSelectLesson={handleSelectLesson} />
				</div>
			) : activeTab === "trainer" ? (
				<div className="gb-panel p-7 space-y-5">
					<PageHeader
						kicker="Practice"
						title="Note Memory Trainer"
						description="Use short visual and ear-first drills to connect note names, fretboard locations, and pitch faster."
					/>
					<NoteMemoryTrainer />
				</div>
			) : (
				<div className="gb-panel p-7 space-y-5">
					<PageHeader
						kicker="Explore"
						title="Fretboard Explorer"
						description="Interactive theory lab for mapping scales, chords, arpeggios, and interval shapes across the neck."
					/>
					<ExplorerPanel />
				</div>
			)}

			<ConfirmDialog
				isOpen={showCompleteDialog}
				onClose={handleCompleteDialogClose}
				title="Lesson Completed!"
				message="Great job! You've finished this lesson."
				confirmText="Continue"
				showCancel={false}
			/>
		</div>
	);
}

import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { ConfirmDialog, PageHeader, TabBar } from "@/components/ui";
import { getLessonById } from "@/data/lessons";
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

const TAB_SET = new Set<LearningTab>(["lessons", "trainer", "explorer"]);

export function LearningPage() {
	const navigate = useNavigate();
	const params = useParams<{ "*": string }>();
	const [showCompleteDialog, setShowCompleteDialog] = useState(false);

	const pathSegments = (params["*"] ?? "")
		.split("/")
		.map((segment) => segment.trim())
		.filter(Boolean);

	const activeTab = (() => {
		const candidate = pathSegments[0] as LearningTab | undefined;
		return candidate && TAB_SET.has(candidate) ? candidate : "lessons";
	})();

	const lessonId = activeTab === "lessons" && pathSegments[1] ? pathSegments[1] : null;
	const selectedLesson = lessonId ? (getLessonById(lessonId) ?? null) : null;

	const tabs = TABS.map((tab) => ({
		label: tab.labelText,
		active: activeTab === tab.label,
		onClick: () => navigate(tab.label === "lessons" ? "/learn" : `/learn/${tab.label}`),
	}));

	const activeTabMeta = useMemo(() => {
		switch (activeTab) {
			case "lessons":
				return {
					kicker: "Learn",
					title: "Guided Lessons",
					description:
						"Structured lessons to help you learn note positions, intervals, and chords on the fretboard, now with playable note examples for ear-and-eye practice.",
				};
			case "trainer":
				return {
					kicker: "Practice",
					title: "Note Memory Trainer",
					description:
						"Use short visual and ear-first drills to connect note names, fretboard locations, and pitch faster.",
				};
			case "explorer":
				return {
					kicker: "Explore",
					title: "Fretboard Explorer",
					description:
						"Interactive theory lab for mapping scales, chords, arpeggios, and interval shapes across the neck.",
				};
		}
	}, [activeTab]);

	const handleSelectLesson = (lesson: Lesson) => {
		navigate(`/learn/lessons/${lesson.id}`);
	};

	const handleLessonComplete = () => {
		setShowCompleteDialog(true);
	};

	const handleExitLesson = () => {
		navigate("/learn");
	};

	const handleCompleteDialogClose = () => {
		setShowCompleteDialog(false);
		navigate("/learn");
	};

	if (pathSegments.length > 0 && !TAB_SET.has(pathSegments[0] as LearningTab)) {
		return <Navigate to="/learn" replace />;
	}

	if (lessonId && !selectedLesson) {
		return <Navigate to="/learn" replace />;
	}

	if (selectedLesson) {
		return (
			<div className="mx-auto max-w-4xl p-6">
				<div className="mb-4">
					<button
						type="button"
						onClick={() => navigate("/learn")}
						className="text-sm font-medium text-[var(--gb-text-muted)] transition-colors hover:opacity-70 focus-visible:outline-none"
					>
						Back to lesson list
					</button>
				</div>
				<LessonPlayer
					lesson={selectedLesson}
					onComplete={handleLessonComplete}
					onExit={handleExitLesson}
				/>
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

	return (
		<div className={`${activeTab === "explorer" ? "w-full" : "mx-auto max-w-5xl"} space-y-6 p-6`}>
			<TabBar tabs={tabs} />

			{activeTab === "lessons" ? (
				<div className="gb-panel space-y-5 p-7">
					<PageHeader
						kicker={activeTabMeta.kicker}
						title={activeTabMeta.title}
						description={activeTabMeta.description}
					/>
					<LessonList onSelectLesson={handleSelectLesson} />
				</div>
			) : activeTab === "trainer" ? (
				<div className="gb-panel space-y-5 p-7">
					<PageHeader
						kicker={activeTabMeta.kicker}
						title={activeTabMeta.title}
						description={activeTabMeta.description}
					/>
					<NoteMemoryTrainer />
				</div>
			) : (
				<div className="gb-panel space-y-5 p-7">
					<PageHeader
						kicker={activeTabMeta.kicker}
						title={activeTabMeta.title}
						description={activeTabMeta.description}
					/>
					<ExplorerPanel />
				</div>
			)}
		</div>
	);
}

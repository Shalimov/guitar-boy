import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { PageHeader } from "@/components/ui";
import { useProgressStore } from "@/hooks/useProgressStore";
import { AnchorNoteMode } from "@/pages/ear-training/AnchorNoteMode";
import { HearIdentifyMode } from "@/pages/ear-training/HearIdentifyMode";
import { ToneMeditationMode } from "@/pages/ear-training/ToneMeditationMode";
import { QuizRunner } from "./QuizRunner";
import type { EarTrainingMode, QuizSettings } from "./QuizSelector";
import { QuizSelector } from "./QuizSelector";
import { SpeedDrillRunner } from "./SpeedDrillRunner";

const EAR_TRAINING_COMPONENTS: Record<EarTrainingMode, React.ReactNode> = {
	"hear-identify": <HearIdentifyMode />,
	"tone-meditation": <ToneMeditationMode />,
	"anchor-note": <AnchorNoteMode />,
};

export function QuizPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams<{ "*": string }>();
	const pathSegments = (params["*"] ?? "")
		.split("/")
		.map((segment) => segment.trim())
		.filter(Boolean);
	const currentMode = pathSegments[0] ?? "selector";
	const quizSettings = location.state as QuizSettings | undefined;
	const earTrainingMode = location.state as EarTrainingMode | undefined;

	const { store, updatePersonalBest } = useProgressStore();

	const handleStartQuiz = (settings: QuizSettings) => {
		navigate("/quiz/play", { state: settings });
	};

	const handleStartEarTraining = (mode: EarTrainingMode) => {
		navigate(`/quiz/ear-training/${mode}`, { state: mode });
	};

	const handleComplete = () => {
		navigate("/quiz");
	};

	// Handle ear training mode display
	if (currentMode === "ear-training" && earTrainingMode) {
		const EarTrainingComponent = EAR_TRAINING_COMPONENTS[earTrainingMode];
		return (
			<div className="p-6">
				<button
					type="button"
					onClick={() => navigate("/quiz")}
					className="text-sm font-medium text-[var(--gb-text-muted)] hover:text-[var(--gb-text)] mb-4"
				>
					← Back to Quiz Studio
				</button>
				{EarTrainingComponent}
			</div>
		);
	}

	if (currentMode === "play") {
		if (!quizSettings) {
			return <Navigate to="/quiz" replace />;
		}

		if (quizSettings.mode === "speed") {
			type SpeedCategory = "note" | "chord" | "interval";
			const category: SpeedCategory =
				quizSettings.type === "chord" || quizSettings.type === "interval"
					? quizSettings.type
					: "note";
			const pb = store.personalBests?.[category] ?? null;

			return (
				<SpeedDrillRunner
					category={category}
					difficulty={quizSettings.difficulty}
					personalBest={pb}
					onComplete={(score: number) => {
						updatePersonalBest(category, score);
						handleComplete();
					}}
					onCancel={handleComplete}
				/>
			);
		}

		return (
			<QuizRunner
				type={quizSettings.type}
				difficulty={quizSettings.difficulty}
				questionCount={quizSettings.questionCount}
				timerEnabled={quizSettings.timerEnabled}
				timerSeconds={quizSettings.timerSeconds}
				deepPractice={quizSettings.deepPractice}
				onComplete={handleComplete}
				onCancel={handleComplete}
			/>
		);
	}

	if (currentMode !== "selector") {
		return <Navigate to="/quiz" replace />;
	}

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6">
			<PageHeader
				kicker="Practice"
				title="Quiz Studio"
				description="Choose a quick-start preset or set up your own custom quiz."
			/>

			<QuizSelector onStartQuiz={handleStartQuiz} onStartEarTraining={handleStartEarTraining} />
		</div>
	);
}

import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { PageHeader } from "@/components/ui";
import { useProgressStore } from "@/hooks/useProgressStore";
import { QuizRunner } from "./QuizRunner";
import type { QuizSettings } from "./QuizSelector";
import { QuizSelector } from "./QuizSelector";
import { SpeedDrillRunner } from "./SpeedDrillRunner";

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

	const { store, updatePersonalBest } = useProgressStore();

	const handleStartQuiz = (settings: QuizSettings) => {
		navigate("/quiz/play", { state: settings });
	};

	const handleComplete = () => {
		navigate("/quiz");
	};

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
		<div className="max-w-4xl mx-auto p-6 space-y-5">
			<PageHeader
				kicker="Practice"
				title="Quiz Studio"
				description="Choose a drill for active recall, then decide whether today is a short warm-up or a focused challenge."
			/>

			<div className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-6 shadow-[var(--gb-shadow-soft)]">
				<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
					Quick guide
				</p>
				<ul className="mt-3 space-y-2 text-sm text-[var(--gb-text-muted)]">
					<li>Use quizzes for new recall reps.</li>
					<li>Keep sessions short when accuracy starts to dip.</li>
					<li>Focus on one skill area at a time for best results.</li>
				</ul>
			</div>

			<QuizSelector onStartQuiz={handleStartQuiz} />
		</div>
	);
}

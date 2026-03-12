import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { Button, PageHeader } from "@/components/ui";
import { useProgressStore } from "@/hooks/useProgressStore";
import { PatternDrillRunner } from "./PatternDrillRunner";
import { QuizRunner } from "./QuizRunner";
import type { QuizSettings } from "./QuizSelector";
import { QuizSelector } from "./QuizSelector";
import { ReviewMode } from "./ReviewMode";
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

	const { getDueCards, updateCard, store, updatePersonalBest } = useProgressStore();
	const dueCards = getDueCards();

	const handleStartQuiz = (settings: QuizSettings) => {
		navigate("/quiz/play", { state: settings });
	};

	const handleStartReview = () => {
		navigate("/quiz/review");
	};

	const handleComplete = () => {
		navigate("/quiz");
	};

	if (currentMode === "review") {
		return (
			<ReviewMode
				cards={dueCards}
				onComplete={(results) => {
					for (const result of results) {
						updateCard(result.updatedCard);
					}
					handleComplete();
				}}
				onCancel={handleComplete}
			/>
		);
	}

	if (currentMode === "play") {
		if (!quizSettings) {
			return <Navigate to="/quiz" replace />;
		}

		if (quizSettings.mode === "speed") {
			type SpeedCategory = "note" | "chord" | "interval" | "pattern";
			const category: SpeedCategory =
				quizSettings.type === "chord" ||
				quizSettings.type === "interval" ||
				quizSettings.type === "pattern"
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

		if (quizSettings.type === "pattern") {
			return (
				<PatternDrillRunner
					questionCount={quizSettings.questionCount}
					questionType="mixed"
					onComplete={handleComplete}
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

			<div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
				<div
					className="rounded-[var(--gb-radius-card)] border border-[var(--gb-accent-soft)] p-6"
					style={{
						background: "color-mix(in srgb, var(--gb-accent-soft) 12%, var(--gb-bg-elev) 88%)",
						boxShadow: "var(--gb-shadow-soft)",
					}}
				>
					<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
						Daily review
					</p>
					<h3 className="mt-2 text-xl font-semibold text-[var(--gb-text)]">Review Due Cards</h3>
					<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
						{dueCards.length > 0
							? `You have ${dueCards.length} card${dueCards.length === 1 ? "" : "s"} ready for spaced repetition.`
							: "No cards are due right now. Start a fresh quiz to generate more review material."}
					</p>
					<div className="mt-4 flex items-center gap-3">
						<Button onClick={handleStartReview} disabled={dueCards.length === 0}>
							{dueCards.length > 0 ? "Start Review" : "No Cards Due"}
						</Button>
						{dueCards.length === 0 && (
							<span className="text-sm text-[var(--gb-text-muted)]">
								Try a quiz session instead.
							</span>
						)}
					</div>
				</div>

				<div className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-6 shadow-[var(--gb-shadow-soft)]">
					<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
						Quick guide
					</p>
					<ul className="mt-3 space-y-2 text-sm text-[var(--gb-text-muted)]">
						<li>Use quizzes for new recall reps.</li>
						<li>Use review mode to protect long-term retention.</li>
						<li>Keep sessions short when accuracy starts to dip.</li>
					</ul>
				</div>
			</div>

			<QuizSelector onStartQuiz={handleStartQuiz} />
		</div>
	);
}

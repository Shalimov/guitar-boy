import { useState } from "react";
import { useProgressStore } from "@/hooks/useProgressStore";
import { QuizRunner } from "./QuizRunner";
import type { QuizSettings } from "./QuizSelector";
import { QuizSelector } from "./QuizSelector";
import { ReviewMode } from "./ReviewMode";

export function QuizPage() {
	const [quizState, setQuizState] = useState<
		{ mode: "selector" } | ({ mode: "quiz" } & QuizSettings) | { mode: "review" }
	>({ mode: "selector" });

	const { getDueCards } = useProgressStore();

	const handleStartQuiz = (settings: QuizSettings) => {
		setQuizState({ mode: "quiz", ...settings });
	};

	const handleStartReview = () => {
		setQuizState({ mode: "review" });
	};

	const handleComplete = () => {
		setQuizState({ mode: "selector" });
	};

	if (quizState.mode === "review") {
		const dueCards = getDueCards();
		return (
			<ReviewMode
				cards={dueCards}
				onComplete={(results) => {
					console.log("Review completed:", results);
					handleComplete();
				}}
				onCancel={handleComplete}
			/>
		);
	}

	if (quizState.mode === "quiz") {
		return (
			<QuizRunner
				type={quizState.type}
				difficulty={quizState.difficulty}
				questionCount={quizState.questionCount}
				timerEnabled={quizState.timerEnabled}
				timerSeconds={quizState.timerSeconds}
				onComplete={handleComplete}
				onCancel={handleComplete}
			/>
		);
	}

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-5">
			<QuizSelector onStartQuiz={handleStartQuiz} />

			{/* Review Due Cards */}
			<div
				className="p-6 rounded-2xl border flex items-center justify-between gap-6"
				style={{
					background: "color-mix(in srgb, var(--gb-accent-soft) 12%, var(--gb-bg-elev) 88%)",
					borderColor: "var(--gb-accent-soft)",
					boxShadow: "var(--gb-shadow-soft)",
				}}
			>
				<div>
					<h3 className="text-lg font-semibold mb-1" style={{ color: "var(--gb-text)" }}>
						Review Due Cards
					</h3>
					<p className="text-sm" style={{ color: "var(--gb-text-muted)" }}>
						Practice cards that are due for review using spaced repetition.
					</p>
				</div>
				<button
					type="button"
					onClick={handleStartReview}
					style={{
						background: "var(--gb-bg-elev)",
						color: "var(--gb-accent-strong)",
						borderColor: "var(--gb-accent-soft)",
					}}
					className="shrink-0 px-5 py-2 rounded-full border font-semibold text-sm transition-all hover:opacity-80 focus-visible:outline-none"
				>
					Start Review
				</button>
			</div>
		</div>
	);
}

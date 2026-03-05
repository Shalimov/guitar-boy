import { useState } from "react";
import { useProgressStore } from "@/hooks/useProgressStore";
import type { CardCategory } from "@/types";
import { QuizRunner } from "./QuizRunner";
import { QuizSelector } from "./QuizSelector";
import { ReviewMode } from "./ReviewMode";

export function QuizPage() {
	const [quizState, setQuizState] = useState<
		| { mode: "selector" }
		| { mode: "quiz"; category: CardCategory; difficulty: string; questionCount: number }
		| { mode: "review" }
	>({ mode: "selector" });

	const { getDueCards } = useProgressStore();

	const handleStartQuiz = (category: CardCategory, difficulty: string, questionCount: number) => {
		setQuizState({ mode: "quiz", category, difficulty, questionCount });
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
				category={quizState.category}
				difficulty={quizState.difficulty}
				questionCount={quizState.questionCount}
				onComplete={handleComplete}
				onCancel={handleComplete}
			/>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<QuizSelector onStartQuiz={handleStartQuiz} />

			<div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
				<h3 className="text-xl font-bold text-gray-900 mb-2">Review Due Cards</h3>
				<p className="text-gray-600 mb-4">
					Practice cards that are due for review using spaced repetition.
				</p>
				<button
					type="button"
					onClick={handleStartReview}
					className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
				>
					Start Review
				</button>
			</div>
		</div>
	);
}

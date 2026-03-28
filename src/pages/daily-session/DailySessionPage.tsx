import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useProgressStore } from "@/hooks/useProgressStore";
import type { SessionSegment } from "@/lib/sessionComposer";
import { composeSession } from "@/lib/sessionComposer";
import { getDueCards } from "@/lib/srs";
import { generateCoolDownPreview, generateWarmUp } from "@/lib/warmup";
import type { AppMode } from "@/types";
import { CoolDownScreen } from "./CoolDownScreen";
import { EarTrainingSegmentView } from "./EarTrainingSegmentView";
import { QuizSegmentView } from "./QuizSegmentView";
import { ReviewSegmentView } from "./ReviewSegmentView";
import { WarmUpSegment } from "./WarmUpSegment";

export function DailySessionPage() {
	const { store, updateCard, addSession } = useProgressStore();
	const navigate = useNavigate();

	const dueCards = useMemo(() => getDueCards(store.cards), [store.cards]);
	const warmUp = useMemo(() => generateWarmUp(store.sessionHistory), [store.sessionHistory]);

	const plan = useMemo(() => {
		const basePlan = composeSession(dueCards, store.sessionHistory, store.earTraining);
		if (warmUp) {
			const warmupSeg: SessionSegment = {
				type: "warmup",
				questions: warmUp.questions,
				sourceMode: warmUp.sourceMode,
			};
			return {
				...basePlan,
				segments: [warmupSeg, ...basePlan.segments],
				totalSteps: basePlan.totalSteps + warmUp.questions.length,
			};
		}
		return basePlan;
	}, [dueCards, store.sessionHistory, warmUp]);

	const [segmentIndex, setSegmentIndex] = useState(0);
	const [completedSteps, setCompletedSteps] = useState(0);
	const [startTime] = useState(Date.now());
	const [sessionResults, setSessionResults] = useState({ correct: 0, total: 0 });
	const [isComplete, setIsComplete] = useState(false);

	const currentSegment = plan.segments[segmentIndex];
	const progress = plan.totalSteps > 0 ? (completedSteps / plan.totalSteps) * 100 : 0;

	const handleSegmentComplete = (correct: number, total: number) => {
		const newCorrect = sessionResults.correct + correct;
		const newTotal = sessionResults.total + total;
		setSessionResults({ correct: newCorrect, total: newTotal });
		setCompletedSteps((prev) => prev + total);

		if (segmentIndex < plan.segments.length - 1) {
			setSegmentIndex((prev) => prev + 1);
		} else {
			// Session complete - record it
			addSession({
				date: new Date().toISOString(),
				mode: "daily-practice" as AppMode,
				totalQuestions: newTotal,
				correct: newCorrect,
				durationMs: Date.now() - startTime,
			});
			setIsComplete(true);
		}
	};

	if (isComplete) {
		return (
			<CoolDownScreen
				previewMessage={generateCoolDownPreview(store.sessionHistory, dueCards.length)}
				sessionScore={sessionResults}
				durationMs={Date.now() - startTime}
				onFinish={() => navigate("/")}
			/>
		);
	}

	return (
		<div className="min-h-[80vh] p-6">
			<div className="mx-auto mb-8 max-w-2xl space-y-4">
				<div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
					<span>Daily Practice</span>
					<span>
						Segment {segmentIndex + 1} of {plan.segments.length}
					</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-[var(--gb-bg-panel)] shadow-inner">
					<div
						className="h-full bg-[var(--gb-accent)] transition-all duration-500 ease-out"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
				{currentSegment.type === "warmup" && (
					<WarmUpSegment
						questions={currentSegment.questions}
						sourceMode={currentSegment.sourceMode}
						onComplete={handleSegmentComplete}
						onSkip={() => handleSegmentComplete(0, currentSegment.questions.length)}
					/>
				)}
				{currentSegment.type === "review" && (
					<ReviewSegmentView
						cards={currentSegment.cards}
						updateCard={updateCard}
						onComplete={handleSegmentComplete}
					/>
				)}
				{currentSegment.type === "quiz" && (
					<QuizSegmentView
						quizType={currentSegment.quizType}
						difficulty={currentSegment.difficulty}
						questionCount={currentSegment.questionCount}
						onComplete={handleSegmentComplete}
					/>
				)}
				{currentSegment.type === "ear-training" && (
					<EarTrainingSegmentView
						rounds={currentSegment.rounds}
						onComplete={handleSegmentComplete}
					/>
				)}
			</div>

			<div className="mt-12 text-center">
				<button
					type="button"
					onClick={() => navigate("/")}
					className="text-xs font-bold uppercase tracking-widest rounded-lg px-4 py-2 transition-all hover:opacity-80 focus-visible:outline-none"
					style={{
						color: "var(--gb-accent)",
						border: "1px solid var(--gb-accent)",
						background: "transparent",
					}}
				>
					Exit Session
				</button>
			</div>
		</div>
	);
}

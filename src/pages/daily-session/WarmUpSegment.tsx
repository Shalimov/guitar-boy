import { useCallback, useEffect, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui/Button";
import { checkAnswer, type Question } from "@/pages/quiz/questions";
import type { FretPosition } from "@/types";

interface WarmUpSegmentProps {
	questions: Question[];
	sourceMode: string;
	onComplete: (correct: number, total: number) => void;
	onSkip: () => void;
}

export function WarmUpSegment({ questions, sourceMode, onComplete, onSkip }: WarmUpSegmentProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [selectedPositions, setSelectedPositions] = useState<FretPosition[]>([]);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);

	const currentQuestion = questions[currentIndex];

	const handleNext = useCallback(() => {
		setFeedback(null);
		setSelectedPositions([]);
		setSelectedNote(null);
		setSelectedInterval(null);

		if (currentIndex < questions.length - 1) {
			setCurrentIndex((prev) => prev + 1);
		} else {
			onComplete(score, questions.length);
		}
	}, [currentIndex, questions.length, score, onComplete]);

	const handleSubmit = useCallback(() => {
		if (feedback || !currentQuestion) return;

		const result = checkAnswer(currentQuestion, selectedPositions, selectedInterval, selectedNote);
		const isCorrect =
			result.incorrect.length === 0 && result.missed.length === 0 && result.correct.length > 0;

		if (isCorrect) {
			setScore((prev) => prev + 1);
		}

		setFeedback({ correct: isCorrect });

		// Auto-advance after 1s
		setTimeout(handleNext, 1200);
	}, [currentQuestion, selectedPositions, selectedInterval, selectedNote, feedback, handleNext]);

	const handleFretClick = (pos: FretPosition) => {
		if (feedback) return;
		if (currentQuestion.type === "note" || currentQuestion.type === "chord") {
			// Single click for speed in warmup
			setSelectedPositions([pos]);
			// Wait a tiny bit to show the dot then submit
			setTimeout(handleSubmit, 100);
		}
	};

	if (!currentQuestion) return null;

	return (
		<div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-3">
					<span className="text-xl">🔥</span>
					<div>
						<p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gb-accent-strong)]">
							Warm-Up
						</p>
						<p className="text-sm font-medium text-[var(--gb-text-muted)]">
							Recall from your previous {sourceMode} session
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onSkip}
					className="text-xs font-bold text-[var(--gb-text-muted)] hover:text-[var(--gb-text)] transition-colors"
				>
					Skip Warm-Up
				</button>
			</div>

			<div className="gb-panel p-6 space-y-6 relative overflow-hidden">
				{feedback && (
					<div
						className={`absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] transition-all duration-300 ${feedback.correct ? "bg-green-500/10" : "bg-red-500/10"}`}
					>
						<div
							className={`text-4xl animate-in zoom-in duration-300 ${feedback.correct ? "scale-110" : "animate-shake"}`}
						>
							{feedback.correct ? "✅" : "❌"}
						</div>
					</div>
				)}

				<div className="text-center">
					<h3 className="text-xl font-bold">
						{currentQuestion.type === "note" && `Where is ${currentQuestion.targetNote}?`}
						{currentQuestion.type === "note-guess" && `Name this note`}
						{currentQuestion.type === "interval" && `Identify the interval`}
						{currentQuestion.type === "chord" && `Find the root for ${currentQuestion.targetChord}`}
					</h3>
				</div>

				<div className="flex justify-center">
					{currentQuestion.type === "note" || currentQuestion.type === "chord" ? (
						<Fretboard
							mode="test"
							onFretClick={handleFretClick}
							state={{
								dots: selectedPositions.map((p) => ({
									position: p,
									shape: "circle",
									color: "var(--gb-accent)",
								})),
								lines: [],
							}}
							fretRange={[1, 12]}
						/>
					) : (
						<div className="space-y-4 w-full max-w-sm">
							<Fretboard
								mode="view"
								state={{
									dots: [
										{
											position: (currentQuestion as any).shownPosition,
											shape: "circle",
											color: "var(--gb-accent)",
										},
									],
									lines: [],
								}}
								fretRange={[1, 12]}
							/>
							<div className="grid grid-cols-4 gap-2">
								{(currentQuestion as any).noteOptions?.map((note: string) => (
									<button
										key={note}
										type="button"
										onClick={() => {
											setSelectedNote(note);
											setTimeout(handleSubmit, 50);
										}}
										className="p-3 rounded-lg border-2 border-[var(--gb-border)] bg-[var(--gb-bg-panel)] font-bold hover:border-[var(--gb-accent)] transition-all"
									>
										{note}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="flex justify-center gap-2">
				{questions.map((q, i) => (
					<div
						key={q.id}
						className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-[var(--gb-accent)]" : i < currentIndex ? "w-4 bg-[var(--gb-accent-soft)]" : "w-4 bg-[var(--gb-border)]"}`}
					/>
				))}
			</div>
		</div>
	);
}

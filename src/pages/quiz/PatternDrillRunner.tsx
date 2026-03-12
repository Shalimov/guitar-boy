import { useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui/Button";
import type { FretPosition } from "@/types";
import {
	checkPatternCompleteAnswer,
	checkPatternNameAnswer,
	generatePatternQuestions,
} from "./patternQuestions";
import { QuizFeedback } from "./QuizFeedback";

interface PatternDrillRunnerProps {
	questionCount: number;
	questionType: "complete" | "name" | "mixed";
	onComplete: () => void;
	onCancel: () => void;
}

export function PatternDrillRunner({
	questionCount,
	questionType,
	onComplete,
	onCancel,
}: PatternDrillRunnerProps) {
	const [questions] = useState(() => generatePatternQuestions(questionCount, questionType));
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedPositions, setSelectedPositions] = useState<FretPosition[]>([]);
	const [selectedName, setSelectedName] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<any | null>(null);
	const [score, setScore] = useState(0);

	const currentQuestion = questions[currentIndex];

	const handleFretClick = (pos: FretPosition) => {
		if (feedback) return;
		if (currentQuestion.type === "pattern-complete") {
			const exists = selectedPositions.find((p) => p.string === pos.string && p.fret === pos.fret);
			if (exists) {
				setSelectedPositions(
					selectedPositions.filter((p) => !(p.string === pos.string && p.fret === pos.fret)),
				);
			} else {
				setSelectedPositions([...selectedPositions, pos]);
			}
		}
	};

	const handleCheck = () => {
		if (currentQuestion.type === "pattern-complete") {
			const result = checkPatternCompleteAnswer(currentQuestion, selectedPositions);
			const isCorrect = result.incorrect.length === 0 && result.missed.length === 0;
			if (isCorrect) setScore((s) => s + 1);
			setFeedback({
				...result,
				isCorrect,
				message: isCorrect
					? "Perfect! You've completed the shape."
					: `Found ${result.correct.length}, missed ${result.missed.length}, and added ${result.incorrect.length} extra dots.`,
			});
		} else {
			if (!selectedName) return;
			const isCorrect = checkPatternNameAnswer(currentQuestion, selectedName);
			if (isCorrect) setScore((s) => s + 1);
			setFeedback({
				isCorrect,
				message: isCorrect
					? `Correct! That is the ${currentQuestion.correctName}.`
					: `Incorrect. That was actually the ${currentQuestion.correctName}.`,
			});
		}
	};

	const handleContinue = () => {
		if (currentIndex < questions.length - 1) {
			setCurrentIndex((i) => i + 1);
			setSelectedPositions([]);
			setSelectedName(null);
			setFeedback(null);
		} else {
			onComplete();
		}
	};

	const progress = ((currentIndex + 1) / questions.length) * 100;

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gb-accent-strong)]">
						Pattern Drill
					</p>
					<h2 className="text-xl font-bold text-[var(--gb-text)]">
						{currentQuestion.type === "pattern-complete"
							? `Complete the ${currentQuestion.patternName}`
							: "Identify this pattern"}
					</h2>
				</div>
				<button
					type="button"
					onClick={onCancel}
					className="text-xs font-bold uppercase tracking-widest text-[var(--gb-text-muted)] hover:text-[var(--gb-text)] transition-colors"
				>
					Exit Drill
				</button>
			</div>

			{/* Progress */}
			<div className="h-1.5 w-full rounded-full bg-[var(--gb-bg-panel)] overflow-hidden shadow-inner">
				<div
					className="h-full bg-[var(--gb-accent)] transition-all duration-500 ease-out"
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Workspace */}
			<div className="gb-panel p-6 space-y-6">
				<div className="flex justify-center bg-[var(--gb-bg-panel)]/30 rounded-xl p-4 border border-[var(--gb-border)]/50">
					<Fretboard
						mode={currentQuestion.type === "pattern-complete" && !feedback ? "test" : "view"}
						state={{
							dots:
								currentQuestion.type === "pattern-complete"
									? [
											...currentQuestion.shownPositions.map((p) => ({
												position: p,
												shape: "circle" as const,
												color: "var(--gb-text-muted)",
											})),
											...selectedPositions.map((p) => ({
												position: p,
												shape: "circle" as const,
												color: feedback
													? feedback.correct.some(
															(cp: FretPosition) => cp.string === p.string && cp.fret === p.fret,
														)
														? "#16a34a"
														: "#dc2626"
													: "var(--gb-accent)",
											})),
											...(feedback?.missed || []).map((p: FretPosition) => ({
												position: p,
												shape: "circle" as const,
												color: "#eab308", // Yellow for missed
												label: "!",
											})),
										]
									: currentQuestion.shownPositions.map((p) => ({
											position: p,
											shape: "circle" as const,
											color: feedback
												? feedback.isCorrect
													? "#16a34a"
													: "#dc2626"
												: "var(--gb-accent)",
										})),
							lines: [],
						}}
						onFretClick={handleFretClick}
						fretRange={[1, 12]}
					/>
				</div>

				{currentQuestion.type === "pattern-name" && !feedback && (
					<div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
						{currentQuestion.nameOptions.map((option) => (
							<button
								key={option}
								type="button"
								onClick={() => setSelectedName(option)}
								className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${
									selectedName === option
										? "border-[var(--gb-accent)] bg-[var(--gb-accent-soft)] text-[var(--gb-accent-strong)]"
										: "border-[var(--gb-border)] bg-[var(--gb-bg-panel)] hover:border-[var(--gb-accent-soft)] text-[var(--gb-text-muted)]"
								}`}
							>
								{option}
							</button>
						))}
					</div>
				)}

				<div className="flex justify-center">
					{!feedback ? (
						<Button
							onClick={handleCheck}
							disabled={
								currentQuestion.type === "pattern-complete"
									? selectedPositions.length === 0
									: !selectedName
							}
							className="px-8"
						>
							Check Answer
						</Button>
					) : (
						<div className="w-full">
							<QuizFeedback
								isCorrect={feedback.isCorrect}
								message={feedback.message}
								correctPositions={
									currentQuestion.type === "pattern-complete" ? feedback.correct : []
								}
								missedPositions={currentQuestion.type === "pattern-complete" ? feedback.missed : []}
								incorrectPositions={
									currentQuestion.type === "pattern-complete" ? feedback.incorrect : []
								}
								onContinue={handleContinue}
							/>
						</div>
					)}
				</div>
			</div>

			<div className="text-center">
				<p className="text-sm font-bold text-[var(--gb-text-muted)]">
					Score: {score}/{currentIndex + (feedback ? 1 : 0)}
				</p>
			</div>
		</div>
	);
}

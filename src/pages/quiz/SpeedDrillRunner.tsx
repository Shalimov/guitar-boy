import { useCallback, useEffect, useRef, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui/Button";
import { playFretPosition } from "@/lib/audio";
import type { FretPosition } from "@/types";
import {
	checkPatternNameAnswer,
	generatePatternQuestions,
	type PatternQuestion,
} from "./patternQuestions";
import { checkAnswer, generateQuestions, type Question } from "./questions";

interface SpeedDrillRunnerProps {
	category: "note" | "interval" | "chord" | "pattern";
	difficulty: "beginner" | "intermediate" | "advanced";
	personalBest: number | null;
	onComplete: (score: number, isNewRecord: boolean) => void;
	onCancel: () => void;
}

export function SpeedDrillRunner({
	category,
	difficulty,
	personalBest,
	onComplete,
	onCancel,
}: SpeedDrillRunnerProps) {
	const [questions, setQuestions] = useState<(Question | PatternQuestion)[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [timeLeft, setTimeLeft] = useState(60);
	const [clickedPosition, setClickedPosition] = useState<FretPosition | null>(null);
	const [isFinished, setIsFinished] = useState(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Initial pool
	useEffect(() => {
		if (category === "pattern") {
			const pool = generatePatternQuestions(50, "name");
			setQuestions(pool);
		} else {
			const pool = generateQuestions(category, difficulty, 50);
			setQuestions(pool);
		}
	}, [category, difficulty]);

	// Global timer
	useEffect(() => {
		timerRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current!);
					setIsFinished(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
			if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
		};
	}, []);

	const handleAnswer = useCallback(
		(pos?: FretPosition[], note?: string, interval?: string) => {
			if (isFinished) return;

			const currentQuestion = questions[currentIndex];
			if (!currentQuestion) return;

			let isCorrect = false;

			if (currentQuestion.type === "pattern-name") {
				isCorrect = note ? checkPatternNameAnswer(currentQuestion, note) : false;
			} else if (currentQuestion.type === "pattern-complete") {
				// We don't really support pattern-complete in speed mode yet,
				// but if we did, we'd check it here. For now, assume false or handled by options.
				isCorrect = false;
			} else {
				// Regular Question
				const result = checkAnswer(currentQuestion, pos || [], interval || null, note || null);
				isCorrect =
					result.incorrect.length === 0 && result.missed.length === 0 && result.correct.length > 0;
			}

			if (isCorrect) {
				setScore((prev) => prev + 1);
			}

			// Clear any pending feedback timer
			if (feedbackTimerRef.current) {
				clearTimeout(feedbackTimerRef.current);
			}

			// Show clicked position briefly before advancing
			setClickedPosition(null);

			if (currentIndex < questions.length - 1) {
				setCurrentIndex((prev) => prev + 1);
			} else {
				// Pool exhausted (unlikely in 60s)
				setIsFinished(true);
			}
		},
		[currentIndex, isFinished, questions],
	);

	const handleFretClick = (pos: FretPosition) => {
		const current = questions[currentIndex];
		if (current.type === "note" || current.type === "chord") {
			// Show visual feedback immediately
			setClickedPosition(pos);

			// Delay answer handling briefly so user sees what they clicked
			feedbackTimerRef.current = setTimeout(() => {
				handleAnswer([pos]);
			}, 150);
		}
	};

	if (isFinished) {
		const isNewRecord = score > (personalBest ?? 0);
		return (
			<div className="max-w-md mx-auto p-8 text-center space-y-8 animate-in fade-in zoom-in duration-500">
				<div className="space-y-2">
					<h2 className="text-3xl font-black text-[var(--gb-accent-strong)]">Time's Up!</h2>
					<p className="text-[var(--gb-text-muted)] font-medium">Session Complete</p>
				</div>

				<div className="py-10 rounded-3xl bg-[var(--gb-bg-elev)] border-2 border-[var(--gb-border)] shadow-2xl relative overflow-hidden">
					{isNewRecord && (
						<div className="absolute top-4 right-4 rotate-12 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded shadow-sm animate-bounce">
							NEW RECORD
						</div>
					)}
					<div className="text-7xl font-black text-[var(--gb-text)] tabular-nums">{score}</div>
					<div className="text-xs font-bold uppercase tracking-widest text-[var(--gb-text-muted)] mt-2">
						Correct Answers
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="p-4 rounded-2xl bg-[var(--gb-bg-panel)] border border-[var(--gb-border)]">
						<div className="text-xs font-bold text-[var(--gb-text-muted)] uppercase tracking-tighter">
							Personal Best
						</div>
						<div className="text-xl font-bold">{personalBest ?? 0}</div>
					</div>
					<div className="p-4 rounded-2xl bg-[var(--gb-bg-panel)] border border-[var(--gb-border)]">
						<div className="text-xs font-bold text-[var(--gb-text-muted)] uppercase tracking-tighter">
							Category
						</div>
						<div className="text-xl font-bold capitalize">{category}</div>
					</div>
				</div>

				<div className="flex flex-col gap-3 pt-4">
					<Button onClick={() => onComplete(score, isNewRecord)} className="w-full py-4 text-lg">
						Save Progress
					</Button>
					<Button variant="secondary" onClick={onCancel} className="w-full">
						Try Regular Quiz
					</Button>
				</div>
			</div>
		);
	}

	const currentQuestion = questions[currentIndex];
	if (!currentQuestion)
		return <div className="p-10 text-center animate-pulse">Generating drill...</div>;

	return (
		<div className="max-w-[1280px] w-full mx-auto p-6 space-y-6">
			{/* Header HUD */}
			<div className="flex justify-between items-center bg-[var(--gb-bg-panel)] p-4 rounded-2xl border border-[var(--gb-border)] shadow-sm">
				<div className="flex items-center gap-4">
					<div className="bg-[var(--gb-accent)] text-white px-4 py-1 rounded-full font-black text-xl tabular-nums shadow-sm">
						{score}
					</div>
					<span className="text-xs font-black uppercase tracking-widest text-[var(--gb-text-muted)]">
						Score
					</span>
				</div>

				<div className="flex flex-col items-center">
					<div
						className={`text-3xl font-black tabular-nums ${timeLeft < 10 ? "text-red-500 animate-pulse scale-110" : "text-[var(--gb-text)]"} transition-all`}
					>
						{timeLeft}s
					</div>
					<div className="text-[10px] font-black uppercase tracking-widest text-[var(--gb-text-muted)]">
						Remaining
					</div>
				</div>

				<button
					type="button"
					onClick={onCancel}
					className="text-xs font-bold uppercase tracking-widest text-[var(--gb-text-muted)] hover:text-red-500 transition-colors"
				>
					Quit
				</button>
			</div>

			{/* Speed Question Card */}
			<div className="gb-panel p-8 min-h-[400px] flex flex-col items-center justify-center space-y-8">
				<div className="text-center space-y-2">
					<h3 className="text-2xl font-black text-[var(--gb-text)]">
						{currentQuestion.type === "note" && (
							<>
								Find <span className="text-[var(--gb-accent)]">{currentQuestion.targetNote}</span>
								{currentQuestion.targetStringLabel && (
									<span className="text-lg font-medium text-[var(--gb-text-muted)] ml-2">
										on the {currentQuestion.targetStringLabel} string
									</span>
								)}
							</>
						)}
						{(currentQuestion.type === "note-guess" ||
							currentQuestion.type === "note-guess-sound") &&
							"Identify the Note"}
						{currentQuestion.type === "interval" && "What Interval?"}
						{currentQuestion.type === "chord" && (
							<>
								Place{" "}
								<span className="text-[var(--gb-accent)]">
									{currentQuestion.chordTone || "Root"}
								</span>
								{currentQuestion.targetStringLabel && (
									<span className="text-lg font-medium text-[var(--gb-text-muted)] ml-2">
										on the {currentQuestion.targetStringLabel} string
									</span>
								)}
							</>
						)}
						{(currentQuestion.type === "pattern-complete" ||
							currentQuestion.type === "pattern-name") &&
							"Identify the Pattern"}
					</h3>
					<p className="text-sm text-[var(--gb-text-muted)] font-medium">Quickly!</p>
				</div>

				<div className="w-full">
					{currentQuestion.type === "note" || currentQuestion.type === "chord" ? (
						<div className="w-full overflow-x-auto pb-4">
							<Fretboard
								mode="test"
								onFretClick={handleFretClick}
								state={{ dots: [], lines: [] }}
								fretRange={difficulty === "advanced" ? [1, 22] : [1, 12]}
								selectedPositions={clickedPosition ? [clickedPosition] : []}
							/>
						</div>
					) : currentQuestion.type === "note-guess" ||
						currentQuestion.type === "note-guess-sound" ? (
						<div className="space-y-8 w-full">
							<div className="flex justify-center h-48 items-center bg-[var(--gb-bg-panel)] rounded-2xl border border-[var(--gb-border)] relative">
								{currentQuestion.type === "note-guess" ? (
									<div className="w-full overflow-x-auto pb-4 pt-4">
										<Fretboard
											mode="view"
											state={{
												dots: [
													{
														position: currentQuestion.shownPosition,
														shape: "circle",
														color: "var(--gb-accent)",
													},
												],
												lines: [],
											}}
											fretRange={difficulty === "advanced" ? [1, 22] : [1, 12]}
										/>
									</div>
								) : (
									<Button
										variant="secondary"
										className="p-8 rounded-full text-4xl hover:scale-110 transition-transform"
										onClick={() => playFretPosition(currentQuestion.shownPosition, "2n")}
									>
										🔊
									</Button>
								)}
							</div>
							<div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
								{currentQuestion.noteOptions.map((note) => (
									<button
										key={note}
										type="button"
										onClick={() => handleAnswer(undefined, note)}
										className="py-4 rounded-xl font-black border-2 border-[var(--gb-border)] bg-[var(--gb-bg-panel)] hover:border-[var(--gb-accent)] hover:bg-[var(--gb-accent-soft)] transition-all"
									>
										{note}
									</button>
								))}
							</div>
						</div>
					) : currentQuestion.type === "pattern-complete" ||
						currentQuestion.type === "pattern-name" ? (
						<div className="space-y-8 w-full">
							<div className="flex justify-center flex-col min-h-48 items-center bg-[var(--gb-bg-panel)] rounded-2xl border border-[var(--gb-border)] relative w-full overflow-hidden">
								<div className="w-full overflow-x-auto pb-4 pt-4">
									<Fretboard
										mode="view"
										state={{
											dots: currentQuestion.shownPositions.map((p: FretPosition) => ({
												position: p,
												shape: "circle",
												color: "var(--gb-accent)",
											})),
											lines: [],
										}}
										fretRange={difficulty === "advanced" ? [1, 22] : [1, 12]}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
								{currentQuestion.type === "pattern-name" &&
									currentQuestion.nameOptions.map((option: string) => (
										<button
											key={option}
											type="button"
											onClick={() => handleAnswer(undefined, option)}
											className="py-4 rounded-xl font-black border-2 border-[var(--gb-border)] bg-[var(--gb-bg-panel)] hover:border-[var(--gb-accent)] hover:bg-[var(--gb-accent-soft)] transition-all text-sm"
										>
											{option}
										</button>
									))}
							</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}

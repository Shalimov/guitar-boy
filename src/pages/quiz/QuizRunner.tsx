import { useCallback, useEffect, useRef, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { TipOverlay } from "@/components/ui/TipOverlay";
import type { Tip } from "@/data/tips";
import { useProgressStore } from "@/hooks/useProgressStore";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import { playFretPosition } from "@/lib/audio";
import { toErrorKey } from "@/lib/mistakeAnalysis";
import { getFrequencyAtFret, getNoteAtFret } from "@/lib/music";
import { shouldShowTip } from "@/lib/tipEngine";
import type { FretPosition } from "@/types";
import { FollowUpPrompt } from "./FollowUpPrompt";
import { type AnsweredQuestionType, type FollowUp, generateFollowUp } from "./followUp";
import { QuizFeedback } from "./QuizFeedback";
import type { Difficulty, QuizType } from "./QuizSelector";
import { checkAnswer, generateQuestions, type Question } from "./questions";
import { SessionSummary } from "./SessionSummary";

interface QuizRunnerProps {
	type: QuizType;
	difficulty: Difficulty;
	questionCount: number;
	timerEnabled: boolean;
	timerSeconds: number;
	onComplete: () => void;
	onCancel: () => void;
	deepPractice: boolean;
}

const QUESTION_TITLES: Record<Question["type"], string> = {
	note: "Find the Note",
	"note-guess": "Guess the Note",
	"note-guess-sound": "Guess by Sound",
	interval: "Identify the Interval",
	chord: "Build the Chord",
};

export function QuizRunner({
	type,
	difficulty,
	questionCount,
	timerEnabled,
	timerSeconds,
	onComplete,
	onCancel,
	deepPractice,
}: QuizRunnerProps) {
	const { store, recordMistakes, dismissTip } = useProgressStore();
	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedPositions, setSelectedPositions] = useState<FretPosition[]>([]);
	const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<ReturnType<typeof checkAnswer> | null>(null);
	const [soundDirectionHint, setSoundDirectionHint] = useState<"higher" | "lower" | "same" | null>(
		null,
	);
	const [followUp, setFollowUp] = useState<FollowUp | null>(null);
	const [activeTip, setActiveTip] = useState<Tip | null>(null);
	const [score, setScore] = useState(0);
	const [startTime] = useState(Date.now());
	const [showSummary, setShowSummary] = useState(false);

	const playedQuestionIdRef = useRef<string | null>(null);
	const currentQuestion = questions[currentQuestionIndex];

	const modeMapping: Record<string, "quiz-note" | "quiz-interval" | "quiz-chord"> = {
		note: "quiz-note",
		"note-guess": "quiz-note",
		"note-guess-sound": "quiz-note",
		interval: "quiz-interval",
		chord: "quiz-chord",
	};

	const modeKey = modeMapping[type] || ("quiz-note" as const);
	const adaptiveState = store.adaptiveState;
	const effectiveFretMax = adaptiveState ? adaptiveState[modeKey]?.effectiveFretMax : undefined;

	// Use adaptive fret max if it exists and we are in "suggested" range or it's a specific goal
	const maxFret =
		effectiveFretMax &&
		difficulty ===
			(effectiveFretMax > 12 ? "advanced" : effectiveFretMax > 5 ? "intermediate" : "beginner")
			? effectiveFretMax
			: difficulty === "beginner"
				? 5
				: difficulty === "intermediate"
					? 12
					: 24;
	const minFret = 1;

	const { timeLeft, resetTimer } = useQuizTimer({
		enabled: timerEnabled,
		seconds: timerSeconds,
		onTimeout: () => submitAnswerRef.current?.(),
		paused: feedback !== null,
	});

	const submitAnswerRef = useRef<(() => void) | null>(null);

	const handleGenerateQuestions = useCallback(() => {
		return generateQuestions(type, difficulty, questionCount, undefined, {
			min: minFret,
			max: maxFret,
		});
	}, [type, difficulty, questionCount, maxFret]);

	useEffect(() => {
		setQuestions(handleGenerateQuestions());
	}, [handleGenerateQuestions]);

	const handleSubmitAnswer = useCallback(() => {
		if (!currentQuestion) return;

		const result = checkAnswer(currentQuestion, selectedPositions, selectedInterval, selectedNote);
		if (result.correct.length > 0 && result.incorrect.length === 0 && result.missed.length === 0) {
			setScore((prev) => prev + 1);

			if (deepPractice) {
				const note = getNoteAtFret(result.correct[0]);
				const fu = generateFollowUp(
					currentQuestion.type as AnsweredQuestionType,
					note,
					result.correct[0],
					[minFret, maxFret],
				);
				if (fu) {
					setFollowUp(fu);
					return;
				}
			}
		} else {
			// Record mistakes
			const mistakePositions = [...result.incorrect, ...result.missed];
			if (mistakePositions.length > 0) {
				recordMistakes(mistakePositions);

				// Contextual Tip logic
				const pos = mistakePositions[0];
				const key = toErrorKey(pos);
				const currentErrors = (store.mistakeLog?.errors[key] ?? 0) + 1;
				const noteName = getNoteAtFret(pos);
				const tip = shouldShowTip(noteName, pos, currentErrors, store.dismissedTips ?? []);
				if (tip) {
					setActiveTip(tip);
				}
			}
		}
		setFeedback(result);
	}, [
		currentQuestion,
		selectedPositions,
		selectedInterval,
		selectedNote,
		recordMistakes,
		deepPractice,
		maxFret,
		store.mistakeLog,
		store.dismissedTips,
	]);

	submitAnswerRef.current = handleSubmitAnswer;

	useEffect(() => {
		if (!currentQuestion || currentQuestion.type !== "note-guess-sound" || feedback) return;
		if (playedQuestionIdRef.current === currentQuestion.id) return;

		playedQuestionIdRef.current = currentQuestion.id;
		void playFretPosition(currentQuestion.shownPosition, "2n");
	}, [currentQuestion, feedback]);

	useEffect(() => {
		if (!currentQuestion || currentQuestion.type !== "note-guess-sound") {
			setSoundDirectionHint(null);
			return;
		}

		let previousSoundQuestion: Question | null = null;
		for (let index = currentQuestionIndex - 1; index >= 0; index -= 1) {
			const candidate = questions[index];
			if (candidate?.type === "note-guess-sound") {
				previousSoundQuestion = candidate;
				break;
			}
		}

		if (!previousSoundQuestion || previousSoundQuestion.type !== "note-guess-sound") {
			setSoundDirectionHint(null);
			return;
		}

		const previousFrequency = getFrequencyAtFret(previousSoundQuestion.shownPosition);
		const currentFrequency = getFrequencyAtFret(currentQuestion.shownPosition);
		const delta = currentFrequency - previousFrequency;

		if (Math.abs(delta) < 0.01) {
			setSoundDirectionHint("same");
			return;
		}

		setSoundDirectionHint(delta > 0 ? "higher" : "lower");
	}, [currentQuestion, currentQuestionIndex, questions]);

	const handleReplaySound = useCallback(() => {
		if (!currentQuestion || currentQuestion.type !== "note-guess-sound") return;
		void playFretPosition(currentQuestion.shownPosition, "2n");
	}, [currentQuestion]);

	const handleFretClick = (position: FretPosition) => {
		if (feedback) return;
		if (!currentQuestion) return;
		if (currentQuestion.type === "interval" || currentQuestion.type === "note-guess") return;

		setSelectedPositions((prev) => {
			const already = prev.some((p) => p.string === position.string && p.fret === position.fret);
			if (already) {
				return prev.filter((p) => !(p.string === position.string && p.fret === position.fret));
			}
			return [...prev, position];
		});
	};

	const handleIntervalSelect = (interval: string) => {
		if (feedback) return;
		setSelectedInterval(interval);
	};

	const handleNoteSelect = (note: string) => {
		if (feedback) return;
		setSelectedNote(note);
	};

	const handleCheckAnswer = () => {
		handleSubmitAnswer();
	};

	const handleContinue = useCallback(() => {
		setSelectedPositions([]);
		setSelectedInterval(null);
		setSelectedNote(null);
		setFeedback(null);
		setSoundDirectionHint(null);
		setFollowUp(null);
		playedQuestionIdRef.current = null;

		if (currentQuestionIndex === questions.length - 1) {
			setShowSummary(true);
		} else {
			setCurrentQuestionIndex((prev) => prev + 1);
			if (timerEnabled) resetTimer();
		}
	}, [currentQuestionIndex, questions.length, timerEnabled, resetTimer]);

	if (!currentQuestion) {
		return (
			<div className="p-6" style={{ color: "var(--gb-text-muted)" }}>
				Loading quiz…
			</div>
		);
	}

	if (showSummary) {
		return (
			<SessionSummary
				totalQuestions={questions.length}
				correctCount={score}
				durationMs={Date.now() - startTime}
				onReviewAgain={() => {
					setQuestions(handleGenerateQuestions());
					setCurrentQuestionIndex(0);
					setSelectedPositions([]);
					setSelectedInterval(null);
					setSelectedNote(null);
					setFeedback(null);
					setSoundDirectionHint(null);
					setScore(0);
					setShowSummary(false);
					playedQuestionIdRef.current = null;
				}}
				onReturnToDashboard={onComplete}
			/>
		);
	}

	const timerPct = timerEnabled && !feedback ? (timeLeft / timerSeconds) * 100 : 100;
	const timerBarColor = timerPct > 50 ? "var(--gb-accent)" : timerPct > 25 ? "#ca8a04" : "#dc2626";

	const canSubmit = (() => {
		if (feedback) return false;
		if (currentQuestion.type === "interval") return selectedInterval !== null;
		if (currentQuestion.type === "note-guess" || currentQuestion.type === "note-guess-sound") {
			return selectedNote !== null;
		}
		return selectedPositions.length > 0;
	})();

	const isNoteGuessQuestion =
		currentQuestion.type === "note-guess" || currentQuestion.type === "note-guess-sound";

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-5">
			<div className="space-y-3">
				<div className="flex justify-between items-start">
					<div>
						<p className="gb-page-kicker mb-0.5">Quiz</p>
						<h2 className="gb-page-title">{QUESTION_TITLES[currentQuestion.type]}</h2>
					</div>
					<button
						type="button"
						onClick={onCancel}
						className="text-sm font-medium rounded-lg px-3 py-1.5 transition-all hover:opacity-80 focus-visible:outline-none"
						style={{
							color: "var(--gb-accent)",
							border: "1px solid var(--gb-accent)",
							background: "transparent",
						}}
					>
						Cancel Quiz
					</button>
				</div>

				<div className="flex items-center gap-3">
					<div
						className="flex-1 h-2 rounded-full overflow-hidden"
						style={{ background: "var(--gb-bg-panel)" }}
					>
						<div
							className="h-full rounded-full transition-all"
							style={{
								width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
								background: "var(--gb-accent)",
							}}
						/>
					</div>
					<span
						className="text-xs tabular-nums font-medium"
						style={{ color: "var(--gb-text-muted)" }}
					>
						{currentQuestionIndex + 1} / {questions.length}
					</span>
					<span className="text-xs font-semibold" style={{ color: "var(--gb-accent-strong)" }}>
						Score: {score}
					</span>
				</div>

				{timerEnabled && (
					<div className="flex items-center gap-3">
						<div
							className="flex-1 h-1.5 rounded-full overflow-hidden"
							style={{ background: "var(--gb-bg-panel)" }}
						>
							<div
								className="h-full rounded-full transition-all duration-1000"
								style={{ width: `${timerPct}%`, background: timerBarColor }}
							/>
						</div>
						<span
							className="text-xs font-bold tabular-nums w-7 text-right"
							style={{ color: timerPct <= 25 ? "#dc2626" : "var(--gb-text-muted)" }}
						>
							{feedback ? "" : `${timeLeft}s`}
						</span>
					</div>
				)}
			</div>

			{followUp ? (
				<FollowUpPrompt
					followUp={followUp}
					onComplete={(correct) => {
						if (correct) setScore((prev) => prev + 1);
						handleContinue();
					}}
					onSkip={handleContinue}
				/>
			) : (
				<div
					className="rounded-2xl p-6 space-y-4"
					style={{
						background: "var(--gb-bg-elev)",
						border: "1px solid var(--gb-border)",
						boxShadow: "var(--gb-shadow-soft)",
					}}
				>
					<p className="text-base font-medium" style={{ color: "var(--gb-text)" }}>
						{currentQuestion.type === "note" && (
							<>
								Click all positions of{" "}
								<span className="font-bold" style={{ color: "var(--gb-accent)" }}>
									{currentQuestion.targetNote}
								</span>
								{currentQuestion.targetStringLabel && (
									<span className="text-sm font-medium text-[var(--gb-text-muted)] ml-2">
										on the {currentQuestion.targetStringLabel} string
									</span>
								)}
								<span className="text-sm text-[var(--gb-text-muted)] ml-2">
									({currentQuestion.targetPositions.length} position
									{currentQuestion.targetPositions.length !== 1 ? "s" : ""})
								</span>
							</>
						)}
						{currentQuestion.type === "note-guess" && <>What note is shown on the fretboard?</>}
						{currentQuestion.type === "note-guess-sound" && (
							<>Listen to the note, then choose the correct note name.</>
						)}
						{currentQuestion.type === "interval" && (
							<>What interval is between these two positions?</>
						)}
						{currentQuestion.type === "chord" && (
							<>
								Build the chord:{" "}
								<span className="font-bold" style={{ color: "var(--gb-accent)" }}>
									{currentQuestion.targetChord}
								</span>
							</>
						)}
					</p>

					<div
						className="p-4 rounded-xl"
						style={{ background: "var(--gb-bg-panel)", border: "1px solid var(--gb-border)" }}
					>
						{currentQuestion.type === "note-guess" ? (
							<Fretboard
								mode="view"
								state={{
									dots: [
										{
											position: currentQuestion.shownPosition,
											shape: "circle",
											color: feedback
												? feedback.correct.length > 0
													? "#16a34a"
													: "#dc2626"
												: "var(--gb-accent)",
										},
									],
									lines: [],
								}}
								fretRange={[minFret, maxFret]}
								showNoteNames={false}
								showStringLabels={false}
							/>
						) : currentQuestion.type === "note-guess-sound" ? (
							<div className="space-y-4">
								<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 text-center">
									<p className="text-sm" style={{ color: "var(--gb-text-muted)" }}>
										Use your ear only. Replay the prompt as many times as you need.
									</p>
									{soundDirectionHint && (
										<p
											className="mt-2 text-xs font-medium"
											style={{ color: "var(--gb-accent-strong)" }}
										>
											{soundDirectionHint === "same"
												? "Tip: this prompt is the same pitch as the previous sound prompt."
												: `Tip: this prompt is ${soundDirectionHint} than the previous sound prompt.`}
										</p>
									)}
									<div className="mx-auto mt-4 max-w-md">
										<AudioEqualizer />
									</div>
									<button
										type="button"
										onClick={handleReplaySound}
										style={{ background: "var(--gb-accent)", color: "#fff8ee" }}
										className="mt-4 rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-90 focus-visible:outline-none"
									>
										Play note
									</button>
								</div>
								{feedback && (
									<Fretboard
										mode="view"
										state={{
											dots: [
												{
													position: currentQuestion.shownPosition,
													shape: "circle",
													color: feedback.correct.length > 0 ? "#16a34a" : "#dc2626",
													label: currentQuestion.targetNote,
												},
											],
											lines: [],
										}}
										fretRange={[minFret, maxFret]}
										showStringLabels={false}
									/>
								)}
							</div>
						) : (
							<Fretboard
								mode={currentQuestion.type === "interval" ? "view" : "test"}
								state={{ dots: [], lines: [] }}
								fretRange={[minFret, maxFret]}
								targetPositions={
									currentQuestion.type === "interval" ? currentQuestion.targetPositions : []
								}
								selectedPositions={selectedPositions}
								correctPositions={feedback?.correct ?? []}
								incorrectPositions={feedback?.incorrect ?? []}
								missedPositions={feedback?.missed ?? []}
								onFretClick={handleFretClick}
								showNoteNames
								showStringLabels={false}
							/>
						)}
					</div>

					{isNoteGuessQuestion && (
						<div className="grid grid-cols-4 gap-2">
							{currentQuestion.noteOptions.map((note) => {
								const isSelected = selectedNote === note;
								const isAnswer = feedback && note === currentQuestion.targetNote;
								const isWrong = feedback && isSelected && note !== currentQuestion.targetNote;
								return (
									<button
										key={note}
										type="button"
										onClick={() => handleNoteSelect(note)}
										disabled={!!feedback}
										style={
											isAnswer
												? { background: "#16a34a", color: "#fff" }
												: isWrong
													? { background: "#dc2626", color: "#fff" }
													: isSelected
														? { background: "var(--gb-accent)", color: "#fff8ee" }
														: {
																background: "var(--gb-bg-panel)",
																color: "var(--gb-text)",
																borderColor: "var(--gb-border)",
															}
										}
										className={`py-3 rounded-xl font-bold text-lg border transition-all focus-visible:outline-none ${feedback ? "cursor-not-allowed" : "hover:opacity-90 active:scale-95"}`}
									>
										{note}
									</button>
								);
							})}
						</div>
					)}

					{currentQuestion.type === "interval" && currentQuestion.intervalOptions && (
						<div className="grid grid-cols-2 gap-2">
							{currentQuestion.intervalOptions.map((option) => {
								const isSelected = selectedInterval === option;
								const isAnswer = feedback && option === currentQuestion.targetInterval;
								const isWrong = feedback && isSelected && option !== currentQuestion.targetInterval;
								return (
									<button
										key={option}
										type="button"
										onClick={() => handleIntervalSelect(option)}
										disabled={!!feedback}
										style={
											isAnswer
												? { background: "#16a34a", color: "#fff" }
												: isWrong
													? { background: "#dc2626", color: "#fff" }
													: isSelected
														? { background: "var(--gb-accent)", color: "#fff8ee" }
														: {
																background: "var(--gb-bg-panel)",
																color: "var(--gb-text)",
																borderColor: "var(--gb-border)",
															}
										}
										className={`px-4 py-2.5 rounded-xl font-medium border transition-all focus-visible:outline-none ${feedback ? "cursor-not-allowed" : "hover:opacity-90 active:scale-95"}`}
									>
										{option}
									</button>
								);
							})}
						</div>
					)}

					{!feedback ? (
						<button
							type="button"
							onClick={handleCheckAnswer}
							disabled={!canSubmit}
							style={
								canSubmit
									? {
											background: "var(--gb-accent)",
											color: "#fff8ee",
											boxShadow: "0 2px 10px rgba(179,93,42,0.3)",
										}
									: {
											background: "var(--gb-bg-tab)",
											color: "var(--gb-text-muted)",
											cursor: "not-allowed",
										}
							}
							className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99] focus-visible:outline-none"
						>
							Check Answer
						</button>
					) : (
						<QuizFeedback
							isCorrect={feedback.incorrect.length === 0 && feedback.missed.length === 0}
							message={feedback.message}
							correctPositions={feedback.correct}
							missedPositions={feedback.missed}
							incorrectPositions={feedback.incorrect}
							onContinue={handleContinue}
						/>
					)}

					{activeTip && (
						<div className="mt-6 pt-6 border-t border-[var(--gb-border)]">
							<TipOverlay
								tip={activeTip}
								onDismiss={() => {
									dismissTip(activeTip.id);
									setActiveTip(null);
								}}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { getAllPositionsOfNote, getInterval, getNoteAtFret, NATURAL_NOTES } from "@/lib/music";
import type { FretPosition, NoteName } from "@/types";
import { QuizFeedback } from "./QuizFeedback";
import type { QuizType } from "./QuizSelector";
import { SessionSummary } from "./SessionSummary";

interface QuizRunnerProps {
	type: QuizType;
	difficulty: string;
	questionCount: number;
	timerEnabled: boolean;
	timerSeconds: number;
	onComplete: () => void;
	onCancel: () => void;
}

interface NoteQuestion {
	id: string;
	type: "note";
	targetPositions: FretPosition[];
	targetNote: string;
}

interface NoteGuessQuestion {
	id: string;
	type: "note-guess";
	/** The single position shown on the board */
	shownPosition: FretPosition;
	/** Correct note name */
	targetNote: NoteName;
	/** All 7 natural note options shuffled */
	noteOptions: string[];
}

interface IntervalQuestion {
	id: string;
	type: "interval";
	targetPositions: FretPosition[];
	targetInterval: string;
	intervalOptions: string[];
}

interface ChordQuestion {
	id: string;
	type: "chord";
	targetPositions: FretPosition[];
	targetChord: string;
}

type Question = NoteQuestion | NoteGuessQuestion | IntervalQuestion | ChordQuestion;

interface Feedback {
	correct: FretPosition[];
	incorrect: FretPosition[];
	missed: FretPosition[];
	message?: string;
	/** For note-guess: whether the selected option was right */
	selectedOption?: string;
}

const INTERVAL_NAMES = [
	"Unison",
	"m2",
	"M2",
	"m3",
	"M3",
	"P4",
	"Tritone",
	"P5",
	"m6",
	"M6",
	"m7",
	"M7",
	"Octave",
];

function shuffle<T>(arr: T[]): T[] {
	return [...arr].sort(() => Math.random() - 0.5);
}

export function QuizRunner({
	type,
	difficulty,
	questionCount,
	timerEnabled,
	timerSeconds,
	onComplete,
	onCancel,
}: QuizRunnerProps) {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedPositions, setSelectedPositions] = useState<FretPosition[]>([]);
	const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	const [score, setScore] = useState(0);
	const [startTime] = useState(Date.now());
	const [showSummary, setShowSummary] = useState(false);

	// Timer state
	const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const maxFret = difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 12 : 24;
	const minFret = 1;

	const generateQuestions = useCallback((): Question[] => {
		const generated: Question[] = [];

		for (let i = 0; i < questionCount; i++) {
			if (type === "note") {
				const targetNote = NATURAL_NOTES[Math.floor(Math.random() * NATURAL_NOTES.length)];
				const targetPositions = getAllPositionsOfNote(targetNote, [minFret, maxFret]);
				generated.push({ id: `note-${i}`, type: "note", targetPositions, targetNote });
			} else if (type === "note-guess") {
				// Pick a position whose note is a natural note (no accidentals)
				let shownPosition: FretPosition;
				let targetNote: NoteName;
				do {
					const string = Math.floor(Math.random() * 6);
					const fret = Math.floor(Math.random() * maxFret) + minFret;
					shownPosition = { string, fret };
					targetNote = getNoteAtFret(shownPosition);
				} while (!NATURAL_NOTES.includes(targetNote));
				generated.push({
					id: `note-guess-${i}`,
					type: "note-guess",
					shownPosition,
					targetNote,
					noteOptions: shuffle([...NATURAL_NOTES]) as string[],
				});
			} else if (type === "interval") {
				const string1 = Math.floor(Math.random() * 6);
				const fret1 = Math.floor(Math.random() * maxFret) + minFret;
				const string2 = Math.floor(Math.random() * 6);
				const fret2 = Math.floor(Math.random() * maxFret) + minFret;
				const interval = getInterval(
					{ string: string1, fret: fret1 },
					{ string: string2, fret: fret2 },
				);
				const options = shuffle([
					interval,
					...shuffle(INTERVAL_NAMES.filter((n) => n !== interval)).slice(0, 3),
				]);
				generated.push({
					id: `interval-${i}`,
					type: "interval",
					targetPositions: [
						{ string: string1, fret: fret1 },
						{ string: string2, fret: fret2 },
					],
					targetInterval: interval,
					intervalOptions: options,
				});
			} else if (type === "chord") {
				const rootString = Math.floor(Math.random() * 6);
				const rootFret = Math.floor(Math.random() * maxFret) + minFret;
				const rootNote = getNoteAtFret({ string: rootString, fret: rootFret });
				generated.push({
					id: `chord-${i}`,
					type: "chord",
					targetPositions: [{ string: rootString, fret: rootFret }],
					targetChord: `${rootNote} major`,
				});
			}
		}
		return generated;
	}, [type, questionCount, maxFret]);

	useEffect(() => {
		setQuestions(generateQuestions());
	}, [generateQuestions]);

	const currentQuestion = questions[currentQuestionIndex];

	// ── Timer ────────────────────────────────────────────────────────────────

	const submitAnswer = useCallback(
		(
			overridePositions?: FretPosition[],
			overrideInterval?: string | null,
			overrideNote?: string | null,
		) => {
			if (!currentQuestion) return;

			const positions = overridePositions ?? selectedPositions;
			const interval = overrideInterval !== undefined ? overrideInterval : selectedInterval;
			const note = overrideNote !== undefined ? overrideNote : selectedNote;

			const correct: FretPosition[] = [];
			const incorrect: FretPosition[] = [];
			const missed: FretPosition[] = [];
			let isCorrect = false;

			if (currentQuestion.type === "note") {
				for (const target of currentQuestion.targetPositions) {
					if (positions.some((p) => p.string === target.string && p.fret === target.fret)) {
						correct.push(target);
					} else {
						missed.push(target);
					}
				}
				for (const sel of positions) {
					if (
						!currentQuestion.targetPositions.some(
							(t) => t.string === sel.string && t.fret === sel.fret,
						)
					) {
						incorrect.push(sel);
					}
				}
				isCorrect = incorrect.length === 0 && missed.length === 0;
			} else if (currentQuestion.type === "note-guess") {
				isCorrect = note === currentQuestion.targetNote;
				// For note-guess we use shownPosition for feedback overlay
				if (isCorrect) correct.push(currentQuestion.shownPosition);
				else missed.push(currentQuestion.shownPosition);
			} else if (currentQuestion.type === "interval") {
				if (interval === currentQuestion.targetInterval) {
					correct.push(...currentQuestion.targetPositions);
				} else {
					missed.push(...currentQuestion.targetPositions);
				}
				isCorrect = interval === currentQuestion.targetInterval;
			} else if (currentQuestion.type === "chord") {
				for (const target of currentQuestion.targetPositions) {
					if (positions.some((p) => p.string === target.string && p.fret === target.fret)) {
						correct.push(target);
					} else {
						missed.push(target);
					}
				}
				isCorrect = incorrect.length === 0 && missed.length === 0;
			}

			if (isCorrect) setScore((prev) => prev + 1);

			const answerLabel =
				currentQuestion.type === "note"
					? currentQuestion.targetNote
					: currentQuestion.type === "note-guess"
						? currentQuestion.targetNote
						: currentQuestion.type === "interval"
							? currentQuestion.targetInterval
							: currentQuestion.targetChord;

			setFeedback({
				correct,
				incorrect,
				missed,
				message: isCorrect ? "Correct!" : `Incorrect. The answer was: ${answerLabel}`,
				selectedOption: note ?? interval ?? undefined,
			});
		},
		[currentQuestion, selectedPositions, selectedInterval, selectedNote],
	);

	// Keep a stable ref to submitAnswer so the interval closure is never stale
	const submitAnswerRef = useRef(submitAnswer);
	useEffect(() => {
		submitAnswerRef.current = submitAnswer;
	}, [submitAnswer]);

	// Start/reset timer whenever a new question is shown (feedback cleared)
	useEffect(() => {
		if (!timerEnabled || feedback !== null) return;

		setTimeLeft(timerSeconds);

		timerRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					if (timerRef.current) clearInterval(timerRef.current);
					timerRef.current = null;
					submitAnswerRef.current();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [timerEnabled, timerSeconds, feedback]);

	// ── Interaction handlers ─────────────────────────────────────────────────

	const handleFretClick = (position: FretPosition) => {
		if (feedback) return;
		if (!currentQuestion) return;
		if (currentQuestion.type === "interval" || currentQuestion.type === "note-guess") return;

		setSelectedPositions((prev) => {
			const already = prev.some((p) => p.string === position.string && p.fret === position.fret);
			if (already)
				return prev.filter((p) => !(p.string === position.string && p.fret === position.fret));
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
		submitAnswer();
	};

	const handleContinue = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			setSelectedPositions([]);
			setSelectedInterval(null);
			setSelectedNote(null);
			setFeedback(null);
			if (timerEnabled) setTimeLeft(timerSeconds);
		} else {
			setShowSummary(true);
		}
	};

	// ── Render guards ────────────────────────────────────────────────────────

	if (!currentQuestion)
		return (
			<div className="p-6" style={{ color: "var(--gb-text-muted)" }}>
				Loading quiz…
			</div>
		);

	if (showSummary) {
		return (
			<SessionSummary
				totalQuestions={questions.length}
				correctCount={score}
				durationMs={Date.now() - startTime}
				onReviewAgain={() => {
					setQuestions(generateQuestions());
					setCurrentQuestionIndex(0);
					setSelectedPositions([]);
					setSelectedInterval(null);
					setSelectedNote(null);
					setFeedback(null);
					setScore(0);
					setShowSummary(false);
				}}
				onReturnToDashboard={onComplete}
			/>
		);
	}

	// ── Timer progress bar ───────────────────────────────────────────────────

	const timerPct = timerEnabled && !feedback ? (timeLeft / timerSeconds) * 100 : 100;
	const timerBarColor = timerPct > 50 ? "var(--gb-accent)" : timerPct > 25 ? "#ca8a04" : "#dc2626";

	// ── Question-specific helpers ────────────────────────────────────────────

	const canSubmit = (() => {
		if (feedback) return false;
		if (currentQuestion.type === "interval") return selectedInterval !== null;
		if (currentQuestion.type === "note-guess") return selectedNote !== null;
		return selectedPositions.length > 0;
	})();

	const questionTitle = {
		note: "Find the Note",
		"note-guess": "Guess the Note",
		interval: "Identify the Interval",
		chord: "Build the Chord",
	}[currentQuestion.type];

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-5">
			{/* Header */}
			<div className="space-y-3">
				<div className="flex justify-between items-start">
					<div>
						<p className="gb-page-kicker mb-0.5">Quiz</p>
						<h2 className="gb-page-title">{questionTitle}</h2>
					</div>
					<button
						type="button"
						onClick={onCancel}
						className="text-sm font-medium transition-colors hover:opacity-70 focus-visible:outline-none"
						style={{ color: "var(--gb-text-muted)" }}
					>
						Cancel Quiz
					</button>
				</div>

				{/* Progress bar */}
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

				{/* Timer bar */}
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

			{/* Question card */}
			<div
				className="rounded-2xl p-6 space-y-4"
				style={{
					background: "var(--gb-bg-elev)",
					border: "1px solid var(--gb-border)",
					boxShadow: "var(--gb-shadow-soft)",
				}}
			>
				{/* Prompt */}
				<p className="text-base font-medium" style={{ color: "var(--gb-text)" }}>
					{currentQuestion.type === "note" && (
						<>
							Click all positions of{" "}
							<span className="font-bold" style={{ color: "var(--gb-accent)" }}>
								{currentQuestion.targetNote}
							</span>{" "}
							({currentQuestion.targetPositions.length} position
							{currentQuestion.targetPositions.length !== 1 ? "s" : ""})
						</>
					)}
					{currentQuestion.type === "note-guess" && <>What note is shown on the fretboard?</>}
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

				{/* Fretboard */}
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

				{/* Note-guess multiple-choice buttons */}
				{currentQuestion.type === "note-guess" && (
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

				{/* Interval multiple-choice buttons */}
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

				{/* Check / feedback */}
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
			</div>
		</div>
	);
}

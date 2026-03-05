import { useCallback, useEffect, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { getInterval, getNoteAtFret } from "@/lib/music";
import type { CardCategory, FretPosition } from "@/types";
import { QuizFeedback } from "./QuizFeedback";
import { SessionSummary } from "./SessionSummary";

interface QuizRunnerProps {
	category: CardCategory;
	difficulty: string;
	questionCount: number;
	onComplete: () => void;
	onCancel: () => void;
}

interface Question {
	id: string;
	type: "note" | "interval" | "chord";
	targetPositions: FretPosition[];
	targetNote?: string;
	targetInterval?: string;
	targetChord?: string;
	intervalOptions?: string[];
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

export function QuizRunner({
	category,
	difficulty,
	questionCount,
	onComplete,
	onCancel,
}: QuizRunnerProps) {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedPositions, setSelectedPositions] = useState<FretPosition[]>([]);
	const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<{
		correct: FretPosition[];
		incorrect: FretPosition[];
		missed: FretPosition[];
		message?: string;
	} | null>(null);
	const [score, setScore] = useState(0);
	const [startTime] = useState(Date.now());
	const [showSummary, setShowSummary] = useState(false);

	const generateQuestions = useCallback(() => {
		const generated: Question[] = [];

		for (let i = 0; i < questionCount; i++) {
			if (category === "note") {
				const string = Math.floor(Math.random() * 6);
				const maxFret = difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 12 : 24;
				const fret = Math.floor(Math.random() * maxFret) + 1;
				const targetNote = getNoteAtFret({ string, fret });

				generated.push({
					id: `note-${i}`,
					type: "note",
					targetPositions: [{ string, fret }],
					targetNote,
				});
			} else if (category === "interval") {
				const string1 = Math.floor(Math.random() * 6);
				const maxFret = difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 12 : 24;
				const fret1 = Math.floor(Math.random() * maxFret) + 1;
				const string2 = Math.floor(Math.random() * 6);
				const fret2 = Math.floor(Math.random() * maxFret) + 1;

				const interval = getInterval(
					{ string: string1, fret: fret1 },
					{ string: string2, fret: fret2 },
				);

				// Generate interval options (correct + 3 wrong)
				const wrongIntervals = INTERVAL_NAMES.filter((name) => name !== interval);
				const shuffled = wrongIntervals.sort(() => Math.random() - 0.5);
				const options = [interval, ...shuffled.slice(0, 3)].sort(() => Math.random() - 0.5);

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
			} else if (category === "chord") {
				// Simplified chord quiz - placeholder
				const rootString = Math.floor(Math.random() * 6);
				const maxFret = difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 12 : 24;
				const rootFret = Math.floor(Math.random() * maxFret) + 1;
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
	}, [category, difficulty, questionCount]);

	useEffect(() => {
		setQuestions(generateQuestions());
	}, [generateQuestions]);

	const currentQuestion = questions[currentQuestionIndex];

	const handleFretClick = (position: FretPosition) => {
		if (feedback) return;

		if (currentQuestion?.type === "interval") {
			return; // Intervals use multiple choice, not fret clicks
		}

		setSelectedPositions((prev) => {
			const isSelected = prev.some(
				(pos) => pos.string === position.string && pos.fret === position.fret,
			);
			if (isSelected) {
				return prev.filter(
					(pos) => !(pos.string === position.string && pos.fret === position.fret),
				);
			}
			return [...prev, position];
		});
	};

	const handleIntervalSelect = (interval: string) => {
		if (feedback) return;
		setSelectedInterval(interval);
	};

	const handleCheckAnswer = () => {
		if (!currentQuestion) return;

		const correct: FretPosition[] = [];
		const incorrect: FretPosition[] = [];
		const missed: FretPosition[] = [];

		if (currentQuestion.type === "note") {
			for (const target of currentQuestion.targetPositions) {
				const wasSelected = selectedPositions.some(
					(pos) => pos.string === target.string && pos.fret === target.fret,
				);
				if (wasSelected) {
					correct.push(target);
				} else {
					missed.push(target);
				}
			}

			for (const selected of selectedPositions) {
				const isTarget = currentQuestion.targetPositions.some(
					(target) => target.string === selected.string && target.fret === selected.fret,
				);
				if (!isTarget) {
					incorrect.push(selected);
				}
			}
		} else if (currentQuestion.type === "interval") {
			// For interval quiz, just check if selected interval matches
			if (selectedInterval === currentQuestion.targetInterval) {
				correct.push(...currentQuestion.targetPositions);
			} else {
				missed.push(...currentQuestion.targetPositions);
			}
		} else if (currentQuestion.type === "chord") {
			// Simplified chord validation
			for (const target of currentQuestion.targetPositions) {
				const wasSelected = selectedPositions.some(
					(pos) => pos.string === target.string && pos.fret === target.fret,
				);
				if (wasSelected) {
					correct.push(target);
				} else {
					missed.push(target);
				}
			}
		}

		const isCorrect = incorrect.length === 0 && missed.length === 0;

		if (isCorrect) {
			setScore((prev) => prev + 1);
		}

		setFeedback({
			correct,
			incorrect,
			missed,
			message: isCorrect
				? "Correct!"
				: `Incorrect. The answer was: ${
						currentQuestion.targetNote ||
						currentQuestion.targetInterval ||
						currentQuestion.targetChord
					}`,
		});
	};

	const handleContinue = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			setSelectedPositions([]);
			setSelectedInterval(null);
			setFeedback(null);
		} else {
			setShowSummary(true);
		}
	};

	if (!currentQuestion) {
		return <div className="p-6">Loading quiz...</div>;
	}

	if (showSummary) {
		const durationMs = Date.now() - startTime;
		return (
			<SessionSummary
				totalQuestions={questions.length}
				correctCount={score}
				durationMs={durationMs}
				onReviewAgain={() => {
					setQuestions(generateQuestions());
					setCurrentQuestionIndex(0);
					setSelectedPositions([]);
					setSelectedInterval(null);
					setFeedback(null);
					setScore(0);
					setShowSummary(false);
				}}
				onReturnToDashboard={onComplete}
			/>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-2xl font-bold text-gray-900">
						{category === "note" && "Find the Note"}
						{category === "interval" && "Identify the Interval"}
						{category === "chord" && "Build the Chord"}
					</h2>
					<button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
						Cancel Quiz
					</button>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex-1 bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-500 h-2 rounded-full transition-all"
							style={{
								width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
							}}
						/>
					</div>
					<span className="text-sm text-gray-600">
						{currentQuestionIndex + 1} / {questions.length}
					</span>
					<span className="text-sm font-medium text-gray-900">Score: {score}</span>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="mb-4">
					<p className="text-lg font-medium text-gray-900">
						{currentQuestion.type === "note" && (
							<>
								Click the position of:{" "}
								<span className="text-blue-600 font-bold">{currentQuestion.targetNote}</span>
							</>
						)}
						{currentQuestion.type === "interval" && (
							<>What interval is between these two positions?</>
						)}
						{currentQuestion.type === "chord" && (
							<>
								Build the chord:{" "}
								<span className="text-blue-600 font-bold">{currentQuestion.targetChord}</span>
							</>
						)}
					</p>
				</div>

				<div className="p-4 bg-gray-50 rounded-lg">
					<Fretboard
						mode={currentQuestion.type === "interval" ? "view" : "test"}
						state={{ dots: [], lines: [] }}
						fretRange={[1, difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 12 : 24]}
						targetPositions={
							currentQuestion.type === "interval" ? currentQuestion.targetPositions : []
						}
						selectedPositions={selectedPositions}
						correctPositions={feedback?.correct || []}
						incorrectPositions={feedback?.incorrect || []}
						missedPositions={feedback?.missed || []}
						onFretClick={handleFretClick}
						showNoteNames
					/>
				</div>

				{currentQuestion.type === "interval" && currentQuestion.intervalOptions && (
					<div className="mt-4 grid grid-cols-2 gap-2">
						{currentQuestion.intervalOptions.map((option) => (
							<button
								key={option}
								type="button"
								onClick={() => handleIntervalSelect(option)}
								disabled={!!feedback}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									selectedInterval === option
										? "bg-blue-500 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								} ${feedback ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								{option}
							</button>
						))}
					</div>
				)}

				{!feedback ? (
					<button
						type="button"
						onClick={handleCheckAnswer}
						disabled={
							currentQuestion.type === "interval"
								? !selectedInterval
								: selectedPositions.length === 0
						}
						className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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

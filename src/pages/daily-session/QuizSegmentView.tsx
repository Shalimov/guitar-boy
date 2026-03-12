import { useEffect, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui/Button";
import type { Difficulty, QuizType } from "@/pages/quiz/QuizSelector";
import { checkAnswer, generateQuestions, type Question } from "@/pages/quiz/questions";
import type { FretPosition } from "@/types";

interface QuizSegmentViewProps {
	quizType: QuizType;
	difficulty: Difficulty;
	questionCount: number;
	onComplete: (correct: number, total: number) => void;
}

export function QuizSegmentView({
	quizType,
	difficulty,
	questionCount,
	onComplete,
}: QuizSegmentViewProps) {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedPositions, setSelectedPositions] = useState<FretPosition[]>([]);
	const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<ReturnType<typeof checkAnswer> | null>(null);
	const [score, setScore] = useState(0);

	const currentQuestion = questions[currentIndex];
	const isLast = currentIndex === questions.length - 1;

	const maxFret = difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 12 : 24;
	const minFret = 1;

	useEffect(() => {
		setQuestions(generateQuestions(quizType, difficulty, questionCount));
	}, [quizType, difficulty, questionCount]);

	const handleFretClick = (position: FretPosition) => {
		if (feedback) return;
		if (
			!currentQuestion ||
			currentQuestion.type === "interval" ||
			currentQuestion.type === "note-guess"
		)
			return;

		setSelectedPositions((prev) => {
			const already = prev.some((p) => p.string === position.string && p.fret === position.fret);
			if (already) {
				return prev.filter((p) => !(p.string === position.string && p.fret === position.fret));
			}
			return [...prev, position];
		});
	};

	const handleCheckAnswer = () => {
		if (!currentQuestion) return;
		const result = checkAnswer(currentQuestion, selectedPositions, selectedInterval, selectedNote);
		if (result.correct.length > 0 && result.incorrect.length === 0 && result.missed.length === 0) {
			setScore((prev) => prev + 1);
		}
		setFeedback(result);
	};

	const handleContinue = () => {
		if (isLast) {
			const finalCorrect =
				feedback?.incorrect.length === 0 && feedback?.missed.length === 0 ? score + 1 : score;
			onComplete(finalCorrect, questions.length);
		} else {
			setCurrentIndex((prev) => prev + 1);
			setSelectedPositions([]);
			setSelectedInterval(null);
			setSelectedNote(null);
			setFeedback(null);
		}
	};

	if (!currentQuestion) return null;

	const canSubmit =
		!feedback &&
		((currentQuestion.type === "interval" && selectedInterval !== null) ||
			((currentQuestion.type === "note-guess" || currentQuestion.type === "note-guess-sound") &&
				selectedNote !== null) ||
			(currentQuestion.type !== "interval" &&
				currentQuestion.type !== "note-guess" &&
				currentQuestion.type !== "note-guess-sound" &&
				selectedPositions.length > 0));

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-accent)]">
						Step 2: Targeted Quiz
					</h3>
					<span className="text-xs font-medium text-[var(--gb-text-muted)]">
						{currentIndex + 1} of {questions.length} questions
					</span>
				</div>

				<div className="gb-panel p-6 shadow-[var(--gb-shadow-soft)] space-y-4">
					<p className="font-medium text-[var(--gb-text)]">
						{currentQuestion.type === "note" && `Find ${currentQuestion.targetNote}`}
						{currentQuestion.type === "note-guess" && "What note is this?"}
						{currentQuestion.type === "interval" && "Identify the interval"}
						{currentQuestion.type === "chord" && `Build ${currentQuestion.targetChord}`}
					</p>

					<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4">
						<Fretboard
							mode={
								currentQuestion.type === "interval" || currentQuestion.type === "note-guess"
									? "view"
									: "test"
							}
							state={
								currentQuestion.type === "note-guess"
									? {
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
										}
									: { dots: [], lines: [] }
							}
							fretRange={[minFret, maxFret]}
							targetPositions={
								currentQuestion.type === "interval" ? currentQuestion.targetPositions : []
							}
							selectedPositions={selectedPositions}
							correctPositions={feedback?.correct}
							incorrectPositions={feedback?.incorrect}
							missedPositions={feedback?.missed}
							onFretClick={handleFretClick}
							showNoteNames={!!feedback}
						/>
					</div>

					{(currentQuestion.type === "note-guess" ||
						currentQuestion.type === "note-guess-sound") && (
						<div className="grid grid-cols-4 gap-2">
							{currentQuestion.noteOptions.map((note) => (
								<button
									key={note}
									type="button"
									onClick={() => !feedback && setSelectedNote(note)}
									className={`py-2 rounded-lg font-bold border transition-all ${
										selectedNote === note
											? "bg-[var(--gb-accent)] text-white border-transparent"
											: "bg-[var(--gb-bg-panel)] text-[var(--gb-text)] border-[var(--gb-border)]"
									}`}
								>
									{note}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			<div className="flex justify-end gap-2">
				{!feedback ? (
					<Button onClick={handleCheckAnswer} disabled={!canSubmit}>
						Check Answer
					</Button>
				) : (
					<Button onClick={handleContinue}>{isLast ? "Finish Quiz" : "Next Question"}</Button>
				)}
			</div>
		</div>
	);
}

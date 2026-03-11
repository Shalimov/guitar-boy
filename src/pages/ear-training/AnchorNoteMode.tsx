import { useCallback, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { playFretPosition } from "@/lib/audio";
import { getAllPositionsOfNote } from "@/lib/music";
import type { FretPosition, NoteName } from "@/types";

const ANCHOR_NOTE_SEQUENCE: NoteName[] = ["A", "E", "D", "G", "B", "C", "F"];
const ACCIDENTAL_NOTES: NoteName[] = ["C#/Db", "F#/Gb", "A#/Bb", "D#/Eb", "G#/Ab"];
const ALL_NOTES: readonly NoteName[] = [...ANCHOR_NOTE_SEQUENCE, ...ACCIDENTAL_NOTES];
const FRET_RANGE: [number, number] = [0, 12];
const QUESTIONS_PER_SESSION = 10;
const ACCURACY_THRESHOLD = 0.9;
const _SESSIONS_TO_UNLOCK = 3;

interface AnchorProgress {
	unlockedNotes: number;
	correctCount: number;
	totalCount: number;
	sessionsCompleted: number;
}

function getInitialProgress(): AnchorProgress {
	return {
		unlockedNotes: 1,
		correctCount: 0,
		totalCount: 0,
		sessionsCompleted: 0,
	};
}

export function AnchorNoteMode() {
	const [progress, setProgress] = useState<AnchorProgress>(getInitialProgress);
	const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentPosition, setCurrentPosition] = useState<FretPosition | null>(null);
	const [sessionCorrect, setSessionCorrect] = useState(0);
	const [sessionTotal, setSessionTotal] = useState(0);
	const [showFeedback, setShowFeedback] = useState<"yes" | "no" | null>(null);
	const [sessionActive, setSessionActive] = useState(false);

	const currentNote = ALL_NOTES[currentNoteIndex];
	const notePositions = getAllPositionsOfNote(currentNote, FRET_RANGE);
	const isUnlocked = currentNoteIndex < progress.unlockedNotes;

	const playRandomNote = useCallback(async () => {
		if (notePositions.length === 0) return;

		const randomIndex = Math.floor(Math.random() * notePositions.length);
		const position = notePositions[randomIndex];
		setCurrentPosition(position);
		await playFretPosition(position);
		setIsPlaying(false);
	}, [notePositions]);

	const startSession = useCallback(() => {
		setSessionCorrect(0);
		setSessionTotal(0);
		setShowFeedback(null);
		setSessionActive(true);
		setIsPlaying(true);
		void playRandomNote();
	}, [playRandomNote]);

	const handleAnswer = (isYes: boolean) => {
		if (!currentPosition) return;

		const isPlayedNoteAnchor = notePositions.some(
			(pos) => pos.string === currentPosition.string && pos.fret === currentPosition.fret,
		);
		const isCorrect = isYes === isPlayedNoteAnchor;

		setShowFeedback(isCorrect ? "yes" : "no");

		const afterTotal = sessionTotal + 1;
		const afterCorrect = sessionCorrect + (isCorrect ? 1 : 0);

		setSessionTotal(afterTotal);
		if (isCorrect) {
			setSessionCorrect(afterCorrect);
		}

		setTimeout(() => {
			setShowFeedback(null);
			if (afterTotal >= QUESTIONS_PER_SESSION) {
				const accuracy = afterCorrect / afterTotal;

				setProgress((prev) => ({
					...prev,
					correctCount: prev.correctCount + afterCorrect,
					totalCount: prev.totalCount + afterTotal,
					sessionsCompleted: prev.sessionsCompleted + 1,
					unlockedNotes:
						accuracy >= ACCURACY_THRESHOLD
							? Math.min(prev.unlockedNotes + 1, ALL_NOTES.length)
							: prev.unlockedNotes,
				}));
				setSessionActive(false);
			} else {
				setIsPlaying(true);
				void playRandomNote();
			}
		}, 1000);
	};

	const totalAccuracy =
		progress.totalCount > 0 ? Math.round((progress.correctCount / progress.totalCount) * 100) : 0;

	return (
		<div>
			<PageHeader
				kicker="Anchor Note Training"
				title="Master One Note at a Time"
				description="Learn to recognize a single note deeply before moving to the next"
			/>

			<Card className="mt-6 p-4 bg-[var(--gb-bg-panel)]">
				<h3 className="font-semibold mb-2">How it works</h3>
				<ul className="text-sm text-[var(--gb-text-muted)] space-y-1">
					<li>
						• Start with <strong>A</strong> as your anchor note
					</li>
					<li>• Listen to a note and answer: Is this your anchor note?</li>
					<li>• Get 90% accuracy to unlock the next note</li>
					<li>• Progress through: A → E → D → G → B → C → F → accidentals</li>
				</ul>
			</Card>

			<div className="mt-8">
				<Card className="p-4">
					<h3 className="font-semibold mb-3">Your Progress</h3>
					<div className="flex flex-wrap gap-2">
						{ALL_NOTES.map((note, index) => (
							<button
								key={note}
								type="button"
								onClick={() => {
									if (index < progress.unlockedNotes) {
										setCurrentNoteIndex(index);
										setSessionActive(false);
									}
								}}
								disabled={index >= progress.unlockedNotes}
								className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
									index === currentNoteIndex
										? "bg-[var(--gb-accent)] text-white"
										: index < progress.unlockedNotes
											? "bg-green-600 text-white"
											: "bg-[var(--gb-bg-panel)] text-[var(--gb-text-muted)] cursor-not-allowed"
								}`}
							>
								{note}
							</button>
						))}
					</div>
					<p className="mt-4 text-sm text-[var(--gb-text-muted)]">
						Notes unlocked: {progress.unlockedNotes} / {ALL_NOTES.length}
					</p>
					<p className="text-sm text-[var(--gb-text-muted)]">
						Total accuracy: {totalAccuracy}% ({progress.correctCount}/{progress.totalCount})
					</p>
				</Card>
			</div>

			{isUnlocked ? (
				<>
					<div className="mt-8 text-center">
						<h2 className="text-xl font-semibold">Current Anchor: {currentNote}</h2>
						<p className="text-[var(--gb-text-muted)] mt-2">
							{isPlaying
								? "Listen..."
								: sessionActive
									? "Is this your anchor note?"
									: "Ready to practice?"}
						</p>
					</div>

					<div className="mt-6 flex justify-center">
						<Fretboard
							fretRange={FRET_RANGE}
							mode="view"
							showNoteNames={true}
							targetPositions={currentPosition ? [currentPosition] : []}
						/>
					</div>

					{sessionActive && !isPlaying && (
						<div className="mt-6 flex justify-center gap-4">
							<Button
								onClick={() => handleAnswer(true)}
								variant="primary"
								className="bg-green-600 hover:bg-green-700"
								disabled={showFeedback !== null}
							>
								Yes
							</Button>
							<Button
								onClick={() => handleAnswer(false)}
								variant="primary"
								className="bg-red-600 hover:bg-red-700"
								disabled={showFeedback !== null}
							>
								No
							</Button>
						</div>
					)}

					{showFeedback && (
						<p
							className={`mt-4 text-center font-semibold ${
								showFeedback === "yes" ? "text-green-600" : "text-red-600"
							}`}
						>
							{showFeedback === "yes" ? "✓ Correct!" : "✗ Wrong answer"}
						</p>
					)}

					<div className="mt-8 flex justify-center">
						{!sessionActive ? (
							<Button onClick={startSession} variant="primary">
								Start Session ({QUESTIONS_PER_SESSION} questions)
							</Button>
						) : (
							<p className="text-sm text-[var(--gb-text-muted)]">
								Question {sessionTotal + 1} of {QUESTIONS_PER_SESSION}
							</p>
						)}
					</div>
				</>
			) : (
				<div className="mt-8 text-center">
					<p className="text-[var(--gb-text-muted)]">
						Complete training on previous notes to unlock this one.
					</p>
				</div>
			)}
		</div>
	);
}

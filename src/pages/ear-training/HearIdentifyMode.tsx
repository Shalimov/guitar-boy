import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { playFretPosition } from "@/lib/audio";
import { getNoteAtFret } from "@/lib/music";
import type { FretPosition } from "@/types";

type DifficultyLevel = 1 | 2 | 3 | 4;

interface LevelConfig {
	id: DifficultyLevel;
	name: string;
	strings: number[];
	fretRange: [number, number];
	naturalOnly: boolean;
}

const LEVELS: LevelConfig[] = [
	{
		id: 1,
		name: "Single String (Low E, Frets 0-5)",
		strings: [0],
		fretRange: [0, 5],
		naturalOnly: true,
	},
	{
		id: 2,
		name: "Natural Notes (All Strings)",
		strings: [0, 1, 2, 3, 4, 5],
		fretRange: [0, 12],
		naturalOnly: true,
	},
	{
		id: 3,
		name: "All Notes (Fret 0-12)",
		strings: [0, 1, 2, 3, 4, 5],
		fretRange: [0, 12],
		naturalOnly: false,
	},
	{
		id: 4,
		name: "Full Neck (Fret 0-24)",
		strings: [0, 1, 2, 3, 4, 5],
		fretRange: [0, 24],
		naturalOnly: false,
	},
];

const NATURAL_NOTES_ONLY = ["C", "D", "E", "F", "G", "A", "B"] as const;
const ALL_NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

function getPossibleNotes(config: LevelConfig): string[] {
	if (config.naturalOnly) {
		return [...NATURAL_NOTES_ONLY];
	}
	return [...ALL_NOTES_SHARP];
}

function getRandomPosition(config: LevelConfig): FretPosition {
	const [minFret, maxFret] = config.fretRange;
	const candidates: FretPosition[] = [];

	for (const string of config.strings) {
		for (let fret = minFret; fret <= maxFret; fret += 1) {
			if (!config.naturalOnly) {
				candidates.push({ string, fret });
				continue;
			}

			const note = getNoteAtFret({ string, fret }).split("/")[0];
			if (NATURAL_NOTES_ONLY.includes(note as (typeof NATURAL_NOTES_ONLY)[number])) {
				candidates.push({ string, fret });
			}
		}
	}

	if (candidates.length === 0) {
		const stringIndex = Math.floor(Math.random() * config.strings.length);
		const string = config.strings[stringIndex];
		const fret = Math.floor(Math.random() * (maxFret - minFret + 1)) + minFret;
		return { string, fret };
	}

	return candidates[Math.floor(Math.random() * candidates.length)];
}

function NoteButton({
	note,
	isSelected,
	isCorrect,
	isIncorrect,
	onClick,
}: {
	note: string;
	isSelected: boolean;
	isCorrect: boolean;
	isIncorrect: boolean;
	onClick: () => void;
}) {
	const baseClasses = "px-4 py-3 rounded-lg font-medium transition-all text-sm";
	let bgClasses = "bg-[var(--gb-bg-panel)] hover:bg-[var(--gb-bg-hover)]";

	if (isCorrect) {
		bgClasses = "bg-green-600 text-white";
	} else if (isIncorrect) {
		bgClasses = "bg-red-600 text-white";
	} else if (isSelected) {
		bgClasses = "bg-[var(--gb-accent)] text-white";
	}

	return (
		<button type="button" onClick={onClick} className={`${baseClasses} ${bgClasses}`}>
			{note}
		</button>
	);
}

export function HearIdentifyMode() {
	const [level, setLevel] = useState<DifficultyLevel>(1);
	const [currentPosition, setCurrentPosition] = useState<FretPosition | null>(null);
	const [currentNote, setCurrentNote] = useState<string | null>(null);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [showFeedback, setShowFeedback] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

	const currentLevelConfig = LEVELS[level - 1];

	const possibleNotes = useMemo(() => getPossibleNotes(currentLevelConfig), [currentLevelConfig]);

	const generateNewQuestion = useCallback(() => {
		const position = getRandomPosition(currentLevelConfig);
		const note = getNoteAtFret(position);
		setCurrentPosition(position);
		setCurrentNote(note.split("/")[0]);
		setSelectedNote(null);
		setShowFeedback(false);
	}, [currentLevelConfig]);

	const playCurrentNote = useCallback(async () => {
		if (currentPosition) {
			await playFretPosition(currentPosition, "2n");
		}
	}, [currentPosition]);

	useEffect(() => {
		generateNewQuestion();
	}, [generateNewQuestion]);

	useEffect(() => {
		if (currentPosition) {
			void playCurrentNote();
		}
	}, [currentPosition, playCurrentNote]);

	const handleNoteSelect = (note: string) => {
		if (showFeedback || !currentNote) return;

		setSelectedNote(note);
		setShowFeedback(true);
		const correct = note === currentNote;
		setIsCorrect(correct);
		setSessionStats((prev) => ({
			correct: prev.correct + (correct ? 1 : 0),
			total: prev.total + 1,
		}));
	};

	const handleNext = () => {
		generateNewQuestion();
	};

	const accuracy =
		sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

	return (
		<div>
			<PageHeader
				kicker="Hear & Identify"
				title="What note is this?"
				description="Listen to the note and select its name"
			/>

			<div className="mt-6 flex items-center gap-4">
				<label htmlFor="difficulty-select" className="text-sm font-medium">
					Difficulty:
				</label>
				<select
					id="difficulty-select"
					value={level}
					onChange={(e) => setLevel(Number(e.target.value) as DifficultyLevel)}
					className="rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-3 py-2 text-sm"
				>
					{LEVELS.map((lvl) => (
						<option key={lvl.id} value={lvl.id}>
							{lvl.name}
						</option>
					))}
				</select>
			</div>

			<div className="mt-8 flex flex-col items-center">
				<Button onClick={playCurrentNote} variant="secondary" className="mb-6">
					🔊 Play Again
				</Button>

				<div className="mb-6 w-full max-w-md">
					<AudioEqualizer />
				</div>

				<div className="mb-6 flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)]/70 px-4 py-3">
					<div>
						<p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gb-text-muted)]">
							Listen first
						</p>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							Choose the note name from sound alone, then reveal the fretboard position.
						</p>
					</div>
					<p className="text-sm font-semibold text-[var(--gb-accent-strong)]">
						Accuracy: {sessionStats.correct}/{sessionStats.total} ({accuracy}%)
					</p>
				</div>

				<div className="mb-8 w-full max-w-2xl">
					<Fretboard
						fretRange={currentLevelConfig.fretRange}
						mode="view"
						showNoteNames={showFeedback}
						targetPositions={showFeedback && currentPosition ? [currentPosition] : []}
						correctPositions={showFeedback && isCorrect && currentPosition ? [currentPosition] : []}
						incorrectPositions={
							showFeedback && !isCorrect && currentPosition ? [currentPosition] : []
						}
					/>
				</div>

				<div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
					{possibleNotes.map((note) => (
						<NoteButton
							key={note}
							note={note}
							isSelected={selectedNote === note}
							isCorrect={showFeedback && note === currentNote}
							isIncorrect={showFeedback && selectedNote === note && note !== currentNote}
							onClick={() => handleNoteSelect(note)}
						/>
					))}
				</div>

				{showFeedback && (
					<div className="mt-8 flex flex-col items-center gap-4">
						<p className={`text-lg font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
							{isCorrect ? "Correct!" : `Wrong! The answer was ${currentNote}`}
						</p>
						<Button onClick={handleNext} variant="primary">
							Next Note →
						</Button>
					</div>
				)}
			</div>

			<div className="mt-12 border-t border-[var(--gb-border)] pt-6">
				<p className="text-sm text-[var(--gb-text-muted)]">
					Tip: replay the note once or twice before answering. Reveal the fretboard only after you
					commit.
				</p>
			</div>
		</div>
	);
}

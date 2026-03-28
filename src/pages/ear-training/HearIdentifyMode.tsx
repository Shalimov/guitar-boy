import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import {
	Button,
	ButtonGroup,
	FeedbackPanel,
	KeyboardShortcutsBar,
	NoteSelectionGrid,
	TinyStat,
} from "@/components/ui";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { playFretPosition } from "@/lib/audio";
import { getNoteAtFret, NATURAL_NOTES } from "@/lib/music";
import {
	buildNoteShortcutItems,
	FLAT_KEY_DISPLAY,
	NATURAL_KEY_DISPLAY,
	SHARP_KEY_DISPLAY,
} from "@/lib/shortcuts";
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

const ALL_NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

const ENHARMONICS: Record<string, string> = {
	"C#": "Db", Db: "C#",
	"D#": "Eb", Eb: "D#",
	"F#": "Gb", Gb: "F#",
	"G#": "Ab", Ab: "G#",
	"A#": "Bb", Bb: "A#",
};

function isEnharmonicMatch(a: string, b: string): boolean {
	return a === b || ENHARMONICS[a] === b;
}

const NATURAL_KEY_MAP: Record<string, string> = {
	q: "C",
	w: "D",
	e: "E",
	r: "F",
	t: "G",
	y: "A",
	u: "B",
	Q: "C",
	W: "D",
	E: "E",
	R: "F",
	T: "G",
	Y: "A",
	U: "B",
};

const CHROMATIC_KEY_MAP: Record<string, string> = {
	...NATURAL_KEY_MAP,
	i: "C#",
	o: "D#",
	p: "F#",
	"[": "G#",
	"]": "A#",
	I: "C#",
	O: "D#",
	P: "F#",
	"{": "G#",
	"}": "A#",
};

const NATURAL_GROUP = { label: "Natural Notes", notes: ["A", "B", "C", "D", "E", "F", "G"] };
const SHARP_GROUP = { label: "Sharps (Ctrl)", notes: ["A#", "C#", "D#", "F#", "G#"] };
const FLAT_GROUP = { label: "Flats (Shift)", notes: ["Bb", "Db", "Eb", "Gb", "Ab"] };

function getPossibleNotes(config: LevelConfig): string[] {
	if (config.naturalOnly) {
		return [...NATURAL_NOTES];
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
			if (NATURAL_NOTES.includes(note as (typeof NATURAL_NOTES)[number])) {
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

	const noteGroups = useMemo(() => {
		if (currentLevelConfig.naturalOnly) {
			return [NATURAL_GROUP];
		}
		return [NATURAL_GROUP, SHARP_GROUP, FLAT_GROUP];
	}, [currentLevelConfig.naturalOnly]);

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

	const handleNoteSelect = useCallback(
		(note: string) => {
			if (showFeedback || !currentNote) return;

			setSelectedNote(note);
			setShowFeedback(true);
			const correct = isEnharmonicMatch(note, currentNote);
			setIsCorrect(correct);
			setSessionStats((prev) => ({
				correct: prev.correct + (correct ? 1 : 0),
				total: prev.total + 1,
			}));
		},
		[showFeedback, currentNote],
	);

	const handleNext = useCallback(() => {
		generateNewQuestion();
	}, [generateNewQuestion]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
				return;
			}

			const keyMap = currentLevelConfig.naturalOnly ? NATURAL_KEY_MAP : CHROMATIC_KEY_MAP;
			const note = keyMap[event.key];

			if (note && possibleNotes.includes(note) && !showFeedback) {
				handleNoteSelect(note);
				return;
			}

			if (event.key === " ") {
				event.preventDefault();
				void playCurrentNote();
				return;
			}

			if ((event.key === "Enter" || event.key === "n" || event.key === "N") && showFeedback) {
				event.preventDefault();
				handleNext();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		currentLevelConfig.naturalOnly,
		possibleNotes,
		showFeedback,
		playCurrentNote,
		handleNoteSelect,
		handleNext,
	]);

	const accuracy =
		sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
	const accuracyDisplay = sessionStats.total > 0 ? `${accuracy}%` : "--";
	const keyDisplayMap = useMemo(() => {
		if (currentLevelConfig.naturalOnly) {
			return NATURAL_KEY_DISPLAY;
		}
		return { ...NATURAL_KEY_DISPLAY, ...SHARP_KEY_DISPLAY, ...FLAT_KEY_DISPLAY };
	}, [currentLevelConfig.naturalOnly]);

	const shortcutItems = useMemo(
		() =>
			buildNoteShortcutItems({
				notes: possibleNotes,
				keyDisplayMap,
				includeSpaceAction: "replay",
				includeEnterAction: "next",
			}),
		[possibleNotes, keyDisplayMap],
	);

	return (
		<div className="space-y-6">
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)] lg:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-0.5">Hear &amp; Identify</p>
						<h2 className="text-xl font-semibold text-[var(--gb-text)]">What note is this?</h2>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							Listen to the pitch, then pick the correct note name.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<TinyStat label="Correct" value={String(sessionStats.correct)} statKey="correct" />
						<TinyStat label="Total" value={String(sessionStats.total)} statKey="total" />
						<TinyStat label="Accuracy" value={accuracyDisplay} statKey="accuracy" />
					</div>
				</div>

				<hr className="my-3 border-[var(--gb-border)]" />

				<div className="mt-4">
					<ButtonGroup
						options={LEVELS.map((lvl) => ({
							label: lvl.name,
							value: String(lvl.id),
						}))}
						value={String(level)}
						onChange={(value) => setLevel(Number(value) as DifficultyLevel)}
						label="Select difficulty level"
					/>
				</div>
			</section>

			<section className="space-y-5 rounded-[24px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 shadow-[var(--gb-shadow)]">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-1">Current Prompt</p>
						<h2 className="text-3xl font-semibold text-[var(--gb-text)]">Hear it, then name it</h2>
						<p className="mt-2 max-w-2xl text-sm text-[var(--gb-text-muted)]">
							Working with {currentLevelConfig.naturalOnly ? "natural notes" : "all notes"} in{" "}
							{currentLevelConfig.name.toLowerCase()}. Use your ear first, then confirm.
						</p>
					</div>
					<div className="flex gap-2">
						<Button variant="secondary" size="sm" onClick={playCurrentNote}>
							Replay note
						</Button>
						<Button variant="ghost" size="sm" onClick={handleNext}>
							Skip prompt
						</Button>
					</div>
				</div>

				<div className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
					<div className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4 md:p-5">
						<Fretboard
							fretRange={currentLevelConfig.fretRange}
							mode="view"
							showNoteNames={showFeedback}
							targetPositions={showFeedback && currentPosition ? [currentPosition] : []}
							correctPositions={
								showFeedback && isCorrect && currentPosition ? [currentPosition] : []
							}
							incorrectPositions={
								showFeedback && !isCorrect && currentPosition ? [currentPosition] : []
							}
						/>
						<div className="mt-3 flex items-end gap-3">
							<p className="flex-1 text-xs text-[var(--gb-text-muted)]">
								{showFeedback
									? "The correct position is highlighted above. Replay it to lock in the sound."
									: "Listen to the prompt and try to identify the note before it's revealed."}
							</p>
							<div className="w-40 shrink-0">
								<AudioEqualizer />
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<p className="mb-2 text-sm font-semibold text-[var(--gb-text)]">
								Choose the note name
							</p>
							<KeyboardShortcutsBar items={shortcutItems} className="mb-3" />
							<NoteSelectionGrid
								groups={noteGroups}
								selectedNote={selectedNote}
								correctNote={
									showFeedback && selectedNote && isEnharmonicMatch(selectedNote, currentNote ?? "")
										? selectedNote
										: currentNote
								}
								revealed={showFeedback}
								onSelect={handleNoteSelect}
								disabled={showFeedback}
								variant="class"
								buttonClassName="py-3 px-4 rounded-lg font-bold border transition-all focus-visible:outline-none hover:opacity-90 active:scale-95 disabled:cursor-not-allowed"
							/>
						</div>

						{showFeedback ? (
							<FeedbackPanel
								isCorrect={isCorrect}
								message={
									isCorrect
										? "Correct! Replay the note to reinforce the connection."
										: `Not quite. It was ${currentNote}. Replay it and listen carefully.`
								}
								onNext={handleNext}
								nextLabel="Next prompt"
								onReplay={playCurrentNote}
								replayLabel="Replay answer"
								className="opacity-100 translate-y-0"
							/>
						) : (
							<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-3 py-2 text-xs text-[var(--gb-text-muted)]">
								Waiting for answer. Click a note or use its keyboard shortcut.
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { Button } from "@/components/ui/Button";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { KeyboardShortcutsBar } from "@/components/ui/KeyboardShortcutsBar";
import { NoteButtonGrid } from "@/components/ui/NoteButtonGrid";
import { TinyStat } from "@/components/ui/TinyStat";
import { playFretPosition } from "@/lib/audio";
import { getNoteAtFret } from "@/lib/music";
import { buildNoteShortcutItems } from "@/lib/shortcuts";
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

const NATURAL_KEY_DISPLAY: Record<string, string> = {
	C: "Q",
	D: "W",
	E: "E",
	F: "R",
	G: "T",
	A: "Y",
	B: "U",
};

const CHROMATIC_KEY_DISPLAY: Record<string, string> = {
	...NATURAL_KEY_DISPLAY,
	"C#": "I",
	"D#": "O",
	"F#": "P",
	"G#": "[",
	"A#": "]",
};

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

	const handleNoteSelect = useCallback(
		(note: string) => {
			if (showFeedback || !currentNote) return;

			setSelectedNote(note);
			setShowFeedback(true);
			const correct = note === currentNote;
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
	const keyDisplayMap = currentLevelConfig.naturalOnly
		? NATURAL_KEY_DISPLAY
		: CHROMATIC_KEY_DISPLAY;
	const shortcutItems = buildNoteShortcutItems({
		notes: possibleNotes,
		keyDisplayMap,
		includeSpaceAction: "replay",
		includeEnterAction: "next",
	});

	return (
		<div className="space-y-6">
			{/* ── Section 1: Header Panel ── */}
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

				<div className="flex flex-wrap items-center gap-3 text-xs">
					<span className="font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
						Level
					</span>
					<select
						id="difficulty-select"
						value={level}
						onChange={(e) => setLevel(Number(e.target.value) as DifficultyLevel)}
						className="rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-2.5 py-1.5 text-xs font-medium text-[var(--gb-text)]"
					>
						{LEVELS.map((lvl) => (
							<option key={lvl.id} value={lvl.id}>
								{lvl.name}
							</option>
						))}
					</select>
				</div>
			</section>

			{/* ── Section 2: Drill Area ── */}
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
					{/* Left: Fretboard */}
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

					{/* Right: Answer controls */}
					<div className="space-y-4">
						<div>
							<p className="mb-2 text-sm font-semibold text-[var(--gb-text)]">
								Choose the note name
							</p>
							<KeyboardShortcutsBar items={shortcutItems} className="mb-3" />
							<NoteButtonGrid
								notes={possibleNotes}
								selectedNote={selectedNote}
								correctNote={currentNote}
								revealed={showFeedback}
								onSelect={handleNoteSelect}
								keyDisplayMap={keyDisplayMap}
								disabled={showFeedback}
								buttonClassName={
									currentLevelConfig.naturalOnly ? "py-3 text-xl sm:py-3.5" : "py-2.5 text-lg"
								}
								gridClassName={
									currentLevelConfig.naturalOnly
										? "grid w-full max-w-[560px] grid-cols-4 gap-2 sm:grid-cols-7"
										: "grid w-full max-w-[760px] grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12"
								}
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

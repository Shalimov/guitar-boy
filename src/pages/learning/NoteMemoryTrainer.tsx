import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import {
	Button,
	ButtonGroup,
	FeedbackPanel,
	ShortcutButtons,
	TinyStat,
	Toggle,
} from "@/components/ui";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { playFretPosition } from "@/lib/audio";
import { getNoteAtFret, NATURAL_NOTES } from "@/lib/music";
import { buildNoteShortcutItems, getNoteFromKeyEvent, NATURAL_KEY_DISPLAY } from "@/lib/shortcuts";
import type { FretPosition, NoteName } from "@/types";

type TrainerMode = "visual" | "sound";
type TrainerRangeKey = "first-position" | "octave";

type PositionKey = `${number}-${number}`;

function positionToKey(position: FretPosition): PositionKey {
	return `${position.string}-${position.fret}`;
}

function keyToPosition(key: PositionKey): FretPosition {
	const [string, fret] = key.split("-").map(Number);
	return { string, fret };
}

interface TrainerPrompt {
	position: FretPosition;
	note: NoteName;
}

interface TrainerStats {
	attempts: number;
	correct: number;
	streak: number;
	bestStreak: number;
	mistakesByPosition: Partial<Record<PositionKey, number>>;
}

const TRAINER_STATS_STORAGE_KEY = "guitar-boy.note-memory-trainer.stats";
const INITIAL_TRAINER_STATS: TrainerStats = {
	attempts: 0,
	correct: 0,
	streak: 0,
	bestStreak: 0,
	mistakesByPosition: {},
};

const RANGE_CONFIG: Record<
	TrainerRangeKey,
	{ label: string; fretRange: [number, number]; description: string }
> = {
	"first-position": {
		label: "Frets 0-5",
		fretRange: [0, 5],
		description: "Start with the landmarks every guitarist uses most.",
	},
	octave: {
		label: "Frets 0-12",
		fretRange: [0, 12],
		description: "Stretch the same note map across the full first octave.",
	},
};

const EMPTY_STATE = { dots: [], lines: [] };

function getCandidatePositions(
	fretRange: [number, number],
	includeOpenStrings: boolean,
): FretPosition[] {
	const [minFret, maxFret] = fretRange;
	const positions: FretPosition[] = [];

	for (let string = 0; string < 6; string += 1) {
		for (let fret = minFret; fret <= maxFret; fret += 1) {
			if (!includeOpenStrings && fret === 0) {
				continue;
			}

			const position = { string, fret };
			const note = getNoteAtFret(position);

			if (NATURAL_NOTES.includes(note)) {
				positions.push(position);
			}
		}
	}

	return positions;
}

function normalizeTrainerStats(stats: Partial<TrainerStats> | null | undefined): TrainerStats {
	return {
		attempts: stats?.attempts ?? 0,
		correct: stats?.correct ?? 0,
		streak: stats?.streak ?? 0,
		bestStreak: stats?.bestStreak ?? 0,
		mistakesByPosition: stats?.mistakesByPosition ?? {},
	};
}

function createPrompt(
	candidates: FretPosition[],
	mistakesByPosition: Partial<Record<PositionKey, number>>,
): TrainerPrompt | null {
	if (candidates.length === 0) {
		return null;
	}

	const naturalNotes = candidates.filter((p) => NATURAL_NOTES.includes(getNoteAtFret(p)));

	if (naturalNotes.length === 0) {
		return null;
	}

	const totalWeight = naturalNotes.reduce(
		(sum, pos) => sum + 1 + (mistakesByPosition[positionToKey(pos)] ?? 0),
		0,
	);

	let roll = Math.random() * totalWeight;
	let selectedPosition = naturalNotes[naturalNotes.length - 1];

	for (const pos of naturalNotes) {
		roll -= 1 + (mistakesByPosition[positionToKey(pos)] ?? 0);

		if (roll < 0) {
			selectedPosition = pos;
			break;
		}
	}

	const note = getNoteAtFret(selectedPosition);

	return {
		position: selectedPosition,
		note,
	};
}

function ProblemNotesCard({
	mistakesByPosition,
}: {
	mistakesByPosition: Partial<Record<PositionKey, number>>;
}) {
	const problemPositions = useMemo(() => {
		const entries = Object.entries(mistakesByPosition) as [PositionKey, number][];
		return entries.sort((a, b) => b[1] - a[1]).slice(0, 3);
	}, [mistakesByPosition]);

	if (problemPositions.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-2" data-testid="trainer-stat-problem-notes">
			<span className="text-[10px] font-bold uppercase tracking-wider text-red-500/80">Focus:</span>
			{problemPositions.map(([key, count]) => {
				const pos = keyToPosition(key);
				const note = getNoteAtFret(pos);
				return (
					<span
						key={key}
						className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50/50 px-2 py-0.5 text-[11px] font-medium text-red-700"
					>
						{note} ({pos.string}-{pos.fret})<span className="opacity-60">{count}</span>
					</span>
				);
			})}
		</div>
	);
}

export function NoteMemoryTrainer() {
	const [mode, setMode] = useState<TrainerMode>("visual");
	const [rangeKey, setRangeKey] = useState<TrainerRangeKey>("first-position");
	const [includeOpenStrings, setIncludeOpenStrings] = useState(true);
	const [prompt, setPrompt] = useState<TrainerPrompt | null>(null);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
	const [stats, setStats] = useLocalStorage<TrainerStats>(
		TRAINER_STATS_STORAGE_KEY,
		INITIAL_TRAINER_STATS,
	);
	const normalizedStats = useMemo(() => normalizeTrainerStats(stats), [stats]);
	const mistakesByPositionRef = useRef(normalizedStats.mistakesByPosition);

	const rangeConfig = RANGE_CONFIG[rangeKey];
	const candidatePositions = useMemo(
		() => getCandidatePositions(rangeConfig.fretRange, includeOpenStrings),
		[rangeConfig, includeOpenStrings],
	);

	useEffect(() => {
		mistakesByPositionRef.current = normalizedStats.mistakesByPosition;
	}, [normalizedStats.mistakesByPosition]);

	const queueNextPrompt = useCallback(() => {
		setPrompt(createPrompt(candidatePositions, mistakesByPositionRef.current));
		setSelectedNote(null);
		setFeedback(null);
	}, [candidatePositions]);

	useEffect(() => {
		queueNextPrompt();
	}, [queueNextPrompt]);

	useEffect(() => {
		if (!prompt || mode !== "sound" || feedback) {
			return;
		}

		void playFretPosition(prompt.position, "2n");
	}, [mode, prompt, feedback]);

	const handleReplay = useCallback(() => {
		if (!prompt) {
			return;
		}

		void playFretPosition(prompt.position, "2n");
	}, [prompt]);

	const handleSubmitAnswer = useCallback(
		(note: string) => {
			if (!prompt || feedback) {
				return;
			}

			setSelectedNote(note);
			const isCorrect = note === prompt.note;
			setFeedback({
				correct: isCorrect,
				message: isCorrect
					? "Correct. Say it once more, then replay it to lock in the sound."
					: `Not quite. This is ${prompt.note}. Replay it and connect the pitch to the spot on the neck.`,
			});
			setStats((current) => {
				const nextStats = normalizeTrainerStats(current);
				const nextStreak = isCorrect ? nextStats.streak + 1 : 0;
				const positionKey = positionToKey(prompt.position);

				return {
					attempts: nextStats.attempts + 1,
					correct: nextStats.correct + (isCorrect ? 1 : 0),
					streak: nextStreak,
					bestStreak: Math.max(nextStats.bestStreak, nextStreak),
					mistakesByPosition: isCorrect
						? nextStats.mistakesByPosition
						: {
								...nextStats.mistakesByPosition,
								[positionKey]: (nextStats.mistakesByPosition[positionKey] ?? 0) + 1,
							},
				};
			});
		},
		[feedback, prompt, setStats],
	);

	const handleResetStats = useCallback(() => {
		setStats(INITIAL_TRAINER_STATS);
	}, [setStats]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
				return;
			}

			const note = getNoteFromKeyEvent(event, false);
			if (note && NATURAL_NOTES.includes(note as NoteName) && !feedback) {
				handleSubmitAnswer(note);
				return;
			}

			if (event.key === "Enter" && feedback) {
				event.preventDefault();
				queueNextPrompt();
				return;
			}

			if (event.key === " ") {
				event.preventDefault();
				if (feedback) {
					queueNextPrompt();
				} else if (mode === "sound" && prompt) {
					handleReplay();
				}
				return;
			}

			if ((event.key === "r" || event.key === "R") && mode === "sound" && prompt) {
				handleReplay();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [feedback, handleSubmitAnswer, queueNextPrompt, handleReplay, mode, prompt]);

	const accuracy =
		normalizedStats.attempts === 0
			? "--"
			: `${Math.round((normalizedStats.correct / normalizedStats.attempts) * 100)}%`;
	const revealedDotColor = feedback?.correct ? "#16a34a" : "#dc2626";
	const shortcuts = buildNoteShortcutItems({
		notes: NATURAL_NOTES,
		keyDisplayMap: NATURAL_KEY_DISPLAY,
		includeSpaceAction: mode === "sound" ? "replay" : "next",
		includeEnterAction: "next",
		extra: mode === "sound" ? [{ id: "r", keyLabel: "R", action: "replay" }] : [],
	});

	return (
		<div className="space-y-6">
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)] lg:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-0.5">Note Memory Trainer</p>
						<h2 className="text-xl font-semibold text-[var(--gb-text)]">Practice Loop</h2>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<TinyStat
							label="Attempts"
							value={String(normalizedStats.attempts)}
							statKey="attempts"
						/>
						<TinyStat label="Accuracy" value={accuracy} statKey="accuracy" />
						<TinyStat label="Streak" value={String(normalizedStats.streak)} statKey="streak" />
						<TinyStat
							label="Best"
							value={String(normalizedStats.bestStreak)}
							statKey="best-streak"
						/>
						<ProblemNotesCard mistakesByPosition={normalizedStats.mistakesByPosition} />
						<Button
							variant="ghost"
							size="sm"
							onClick={handleResetStats}
							className="h-8 px-2 text-xs"
						>
							Reset Stats
						</Button>
					</div>
				</div>

				<hr className="my-3 border-[var(--gb-border)]" />

				<div className="flex flex-wrap items-center gap-3 text-xs">
					<ButtonGroup
						options={[
							{ value: "visual", label: "Visual" },
							{ value: "sound", label: "Sound" },
						]}
						value={mode}
						onChange={(newMode) => setMode(newMode as TrainerMode)}
					/>
					<span className="h-4 w-[1px] bg-[var(--gb-border)]" />
					<ButtonGroup
						options={Object.entries(RANGE_CONFIG).map(([key, config]) => ({
							value: key as TrainerRangeKey,
							label: config.label,
						}))}
						value={rangeKey}
						onChange={setRangeKey}
					/>
					<span className="h-4 w-[1px] bg-[var(--gb-border)]" />
					<Toggle checked={includeOpenStrings} onChange={setIncludeOpenStrings} label="Open" />
				</div>
			</section>

			<section className="space-y-5 rounded-[24px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 shadow-[var(--gb-shadow)]">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-1">Current Drill</p>
						<h2 className="text-3xl font-semibold text-[var(--gb-text)]">
							{mode === "visual" ? "Name the marked note" : "Hear it, then name it"}
						</h2>
						<p className="mt-2 max-w-2xl text-sm text-[var(--gb-text-muted)]">
							Working with natural notes in {rangeConfig.label.toLowerCase()}.{" "}
							{mode === "visual"
								? "Look at the spot, say the note out loud, then answer."
								: "Use your ear first, then reveal the fretboard location after you answer."}
						</p>
					</div>
					<div className="flex gap-2">
						{mode === "sound" && (
							<Button variant="secondary" size="sm" onClick={handleReplay} disabled={!prompt}>
								Replay note
							</Button>
						)}
						<Button variant="ghost" size="sm" onClick={queueNextPrompt}>
							Skip prompt
						</Button>
					</div>
				</div>

				{prompt ? (
					<div className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
						<div className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4 md:p-5">
							{mode === "visual" ? (
								<div className="space-y-3">
									<Fretboard
										mode="view"
										state={{
											...EMPTY_STATE,
											dots: [
												{
													position: prompt.position,
													color: feedback ? revealedDotColor : "var(--gb-accent)",
													shape: feedback ? "circle" : "diamond",
													label: feedback ? prompt.note : undefined,
												},
											],
										}}
										fretRange={rangeConfig.fretRange}
										playAudioOnFretClick
										showNoteNames={Boolean(feedback)}
										showStringLabels={false}
										ariaLabel="Visual note trainer"
									/>
									<p className="text-xs text-[var(--gb-text-muted)]">
										Tap the marked note if you want to hear it before answering.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									<div className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 text-center">
										<p className="text-sm text-[var(--gb-text-muted)]">
											Listen to the prompt, picture where that pitch sits on the neck, then choose
											the note name.
										</p>
										<Button className="mt-4" size="sm" onClick={handleReplay}>
											Play prompt
										</Button>
									</div>
									{feedback && (
										<div className="space-y-3">
											<Fretboard
												mode="view"
												state={{
													...EMPTY_STATE,
													dots: [
														{
															position: prompt.position,
															color: revealedDotColor,
															label: prompt.note,
														},
													],
												}}
												fretRange={rangeConfig.fretRange}
												playAudioOnFretClick
												showStringLabels={false}
												ariaLabel="Revealed note position"
											/>
											<p className="text-xs text-[var(--gb-text-muted)]">
												Now replay the answer and notice how the fretboard spot sounds.
											</p>
										</div>
									)}
								</div>
							)}
						</div>

						<div className="space-y-4">
							<div>
								<p className="mb-2 text-sm font-semibold text-[var(--gb-text)]">
									Choose the note name
								</p>
								<ShortcutButtons
									items={shortcuts}
									noteGroups={[
										{
											label: "Natural Notes",
											notes: ["A", "B", "C", "D", "E", "F", "G"],
										},
										{
											label: "Sharps (Ctrl)",
											notes: ["A#", "C#", "D#", "F#", "G#"],
										},
										{
											label: "Flats (Shift)",
											notes: ["Bb", "Db", "Eb", "Gb", "Ab"],
										},
									]}
									selectedNote={selectedNote}
									onNoteSelect={handleSubmitAnswer}
									disabled={feedback !== null}
									showFeedback={feedback !== null}
									correctNote={prompt.note}
								/>
							</div>

							{feedback ? (
								<FeedbackPanel
									isCorrect={feedback.correct}
									message={feedback.message}
									onNext={queueNextPrompt}
									nextLabel="Next prompt"
									onReplay={handleReplay}
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
				) : (
					<div className="rounded-[18px] border border-dashed border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-5 text-sm text-[var(--gb-text-muted)]">
						No natural-note prompts are available in this setup. Expand the fret window or include
						open strings.
					</div>
				)}
			</section>
		</div>
	);
}

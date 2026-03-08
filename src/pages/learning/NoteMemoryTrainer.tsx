import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { playFretPosition } from "@/lib/audio";
import { getNoteAtFret, NATURAL_NOTES } from "@/lib/music";
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

function StatCard({ label, value, statKey }: { label: string; value: string; statKey: string }) {
	return (
		<div
			className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4"
			data-testid={`trainer-stat-${statKey}`}
		>
			<p className="text-xs uppercase tracking-[0.18em] text-[var(--gb-text-muted)]">{label}</p>
			<p className="mt-2 text-2xl font-semibold text-[var(--gb-text)]">{value}</p>
		</div>
	);
}

function ProblemNotesCard({
	mistakesByPosition,
}: {
	mistakesByPosition: Partial<Record<PositionKey, number>>;
}) {
	const problemPositions = useMemo(() => {
		const entries = Object.entries(mistakesByPosition) as [PositionKey, number][];
		return entries.sort((a, b) => b[1] - a[1]).slice(0, 4);
	}, [mistakesByPosition]);

	if (problemPositions.length === 0) {
		return (
			<div
				className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4"
				data-testid="trainer-stat-problem-notes"
			>
				<p className="text-xs uppercase tracking-[0.18em] text-[var(--gb-text-muted)]">
					Focus Areas
				</p>
				<p className="mt-2 text-sm text-[var(--gb-text-muted)]">
					No mistakes yet — keep practicing!
				</p>
			</div>
		);
	}

	return (
		<div
			className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4"
			data-testid="trainer-stat-problem-notes"
		>
			<p className="text-xs uppercase tracking-[0.18em] text-[var(--gb-text-muted)]">Focus Areas</p>
			<div className="mt-3 flex flex-wrap gap-2">
				{problemPositions.map(([key, count]) => {
					const pos = keyToPosition(key);
					const note = getNoteAtFret(pos);
					return (
						<span
							key={key}
							className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-2.5 py-1 text-sm font-medium text-[var(--gb-text)]"
						>
							<span>
								{note} @ {pos.string}-{pos.fret}
							</span>
							<span className="text-xs text-[var(--gb-text-muted)]">({count})</span>
						</span>
					);
				})}
			</div>
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

		void playFretPosition(prompt.position, "4n");
	}, [mode, prompt, feedback]);

	const handleReplay = useCallback(() => {
		if (!prompt) {
			return;
		}

		void playFretPosition(prompt.position, "4n");
	}, [prompt]);

	const handleCheckAnswer = useCallback(() => {
		if (!prompt || !selectedNote) {
			return;
		}

		const isCorrect = selectedNote === prompt.note;
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
	}, [prompt, selectedNote, setStats]);

	const handleResetStats = useCallback(() => {
		setStats(INITIAL_TRAINER_STATS);
	}, [setStats]);

	const accuracy =
		normalizedStats.attempts === 0
			? "--"
			: `${Math.round((normalizedStats.correct / normalizedStats.attempts) * 100)}%`;
	const canCheck = selectedNote !== null && feedback === null;
	const revealedDotColor = feedback?.correct ? "#16a34a" : "#dc2626";

	return (
		<div className="space-y-6">
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-5 shadow-[var(--gb-shadow-soft)]">
				<div className="mb-5">
					<p className="gb-page-kicker mb-1">Practice Loop</p>
					<h2 className="text-2xl font-semibold text-[var(--gb-text)]">
						Train note memory two ways
					</h2>
					<p className="mt-2 text-sm text-[var(--gb-text-muted)]">
						Alternate between seeing a fretboard note and hearing it with no visual cue. That
						eye-to-ear flip is one of the fastest ways to make note names stick.
					</p>
				</div>

				<div className="grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
					<div className="space-y-5">
						<div>
							<p className="mb-2 text-sm font-semibold text-[var(--gb-text)]">Exercise mode</p>
							<div className="flex flex-wrap gap-2">
								<Button
									variant={mode === "visual" ? "primary" : "secondary"}
									size="sm"
									onClick={() => setMode("visual")}
								>
									Name the note
								</Button>
								<Button
									variant={mode === "sound" ? "primary" : "secondary"}
									size="sm"
									onClick={() => setMode("sound")}
								>
									Hear then name
								</Button>
							</div>
						</div>

						<div>
							<p className="mb-2 text-sm font-semibold text-[var(--gb-text)]">Fret window</p>
							<div className="flex flex-wrap gap-2">
								{(
									Object.entries(RANGE_CONFIG) as [
										TrainerRangeKey,
										(typeof RANGE_CONFIG)[TrainerRangeKey],
									][]
								).map(([key, config]) => (
									<Button
										key={key}
										variant={rangeKey === key ? "primary" : "secondary"}
										size="sm"
										onClick={() => setRangeKey(key)}
									>
										{config.label}
									</Button>
								))}
							</div>
							<p className="mt-2 text-xs text-[var(--gb-text-muted)]">{rangeConfig.description}</p>
						</div>

						<label className="flex items-center gap-3 rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-4 py-3 text-sm text-[var(--gb-text)]">
							<input
								type="checkbox"
								checked={includeOpenStrings}
								onChange={(event) => setIncludeOpenStrings(event.target.checked)}
							/>
							<span>Include open strings so you keep hearing the tuning anchors too.</span>
						</label>

						<div className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4 text-sm text-[var(--gb-text-muted)]">
							<p className="font-semibold text-[var(--gb-text)]">Best results</p>
							<p className="mt-2">1. Say the note before you click.</p>
							<p>2. In sound mode, sing or hum it once before answering.</p>
							<p>3. Stay in one fret window until you hit a short streak.</p>
							<p>4. Replay misses immediately so the neck location and pitch reconnect.</p>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
						<StatCard
							label="Attempts"
							value={String(normalizedStats.attempts)}
							statKey="attempts"
						/>
						<StatCard label="Accuracy" value={accuracy} statKey="accuracy" />
						<StatCard label="Streak" value={String(normalizedStats.streak)} statKey="streak" />
						<StatCard
							label="Best streak"
							value={String(normalizedStats.bestStreak)}
							statKey="best-streak"
						/>
						<ProblemNotesCard mistakesByPosition={normalizedStats.mistakesByPosition} />
						<Button variant="ghost" size="sm" onClick={handleResetStats}>
							Reset stats
						</Button>
					</div>
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
								<div className="grid grid-cols-4 gap-2">
									{NATURAL_NOTES.map((note) => {
										const isSelected = selectedNote === note;
										const isCorrectAnswer = feedback && note === prompt.note;
										const isWrongSelection = feedback && isSelected && note !== prompt.note;

										return (
											<button
												key={note}
												type="button"
												onClick={() => setSelectedNote(note)}
												disabled={feedback !== null}
												style={
													isCorrectAnswer
														? { background: "#16a34a", color: "#fff" }
														: isWrongSelection
															? { background: "#dc2626", color: "#fff" }
															: isSelected
																? {
																		background: "var(--gb-accent)",
																		color: "#fff8ee",
																	}
																: {
																		background: "var(--gb-bg-panel)",
																		color: "var(--gb-text)",
																		borderColor: "var(--gb-border)",
																	}
												}
												className={`rounded-xl border py-3 text-lg font-bold transition-all focus-visible:outline-none ${feedback ? "cursor-not-allowed" : "hover:opacity-90 active:scale-95"}`}
											>
												{note}
											</button>
										);
									})}
								</div>
							</div>

							{feedback ? (
								<div
									className="space-y-3 rounded-[18px] p-4"
									style={{
										background: feedback.correct
											? "color-mix(in srgb, #16a34a 12%, var(--gb-bg-elev))"
											: "color-mix(in srgb, #dc2626 8%, var(--gb-bg-elev))",
										border: `1px solid ${feedback.correct ? "color-mix(in srgb, #16a34a 30%, var(--gb-border))" : "color-mix(in srgb, #dc2626 24%, var(--gb-border))"}`,
									}}
								>
									<p
										className="text-sm font-medium"
										style={{ color: feedback.correct ? "#166534" : "#991b1b" }}
									>
										{feedback.message}
									</p>
									<div className="flex gap-2">
										<Button size="sm" onClick={queueNextPrompt}>
											Next prompt
										</Button>
										<Button variant="secondary" size="sm" onClick={handleReplay}>
											Replay answer
										</Button>
									</div>
								</div>
							) : (
								<Button onClick={handleCheckAnswer} disabled={!canCheck} className="w-full">
									Check answer
								</Button>
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

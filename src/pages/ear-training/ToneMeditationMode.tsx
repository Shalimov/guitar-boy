import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { Button } from "@/components/ui/Button";
import { KeyboardShortcutsBar } from "@/components/ui/KeyboardShortcutsBar";
import { TinyStat } from "@/components/ui/TinyStat";
import { playFretPosition } from "@/lib/audio";
import { CHROMATIC_NOTES, getAllPositionsOfNote } from "@/lib/music";
import { buildSimpleShortcutItems } from "@/lib/shortcuts";
import type { FretPosition } from "@/types";

const FRET_RANGE: [number, number] = [0, 12];
const PLAY_INTERVAL_MS = 1200;
const DEFAULT_NOTE = "C";

function getAllFretboardPositions(fretRange: [number, number]): FretPosition[] {
	const positions: FretPosition[] = [];
	for (let string = 0; string < 6; string++) {
		for (let fret = fretRange[0]; fret <= fretRange[1]; fret++) {
			positions.push({ string, fret });
		}
	}
	return positions;
}

export function ToneMeditationMode() {
	const [selectedNote, setSelectedNote] = useState<string>(DEFAULT_NOTE);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentPosition, setCurrentPosition] = useState<FretPosition | null>(null);
	const [positionIndex, setPositionIndex] = useState(0);
	const [positions, setPositions] = useState<FretPosition[]>([]);

	const allPositions = useMemo(() => getAllFretboardPositions(FRET_RANGE), []);
	const notePositions = getAllPositionsOfNote(selectedNote as never, FRET_RANGE);
	const shortcutItems = buildSimpleShortcutItems([
		{ keyLabel: "Space", action: "play/stop", id: "space" },
	]);

	const playPosition = useCallback(async (position: FretPosition) => {
		setCurrentPosition(position);
		await playFretPosition(position, "2n");
	}, []);

	const handleStart = useCallback(() => {
		if (notePositions.length === 0) return;

		setPositions(notePositions);
		setPositionIndex(0);
		setIsPlaying(true);
		void playPosition(notePositions[0]);
	}, [notePositions, playPosition]);

	const handleStop = useCallback(() => {
		setIsPlaying(false);
		setCurrentPosition(null);
		setPositionIndex(0);
	}, []);

	const handleNoteChange = (note: string) => {
		setSelectedNote(note);
		handleStop();
	};

	useEffect(() => {
		if (!isPlaying || positions.length === 0) return;

		const interval = setInterval(() => {
			setPositionIndex((prev) => {
				const next = prev + 1;
				if (next >= positions.length) {
					setIsPlaying(false);
					setCurrentPosition(null);
					return 0;
				}
				void playPosition(positions[next]);
				return next;
			});
		}, PLAY_INTERVAL_MS);

		return () => clearInterval(interval);
	}, [isPlaying, positions, playPosition]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
				return;
			}

			if (event.key === " ") {
				event.preventDefault();
				if (isPlaying) {
					handleStop();
				} else if (notePositions.length > 0) {
					handleStart();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isPlaying, handleStop, handleStart, notePositions.length]);

	return (
		<div className="space-y-6">
			{/* ── Section 1: Header Panel ── */}
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)] lg:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-0.5">Tone Meditation</p>
						<h2 className="text-xl font-semibold text-[var(--gb-text)]">Listen and Visualize</h2>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							Hear a single note played across every fretboard position. Let it sink in.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<TinyStat label="Note" value={selectedNote} statKey="note" />
						<TinyStat label="Positions" value={String(notePositions.length)} statKey="positions" />
					</div>
				</div>

				<hr className="my-3 border-[var(--gb-border)]" />

				<div className="flex flex-wrap items-center gap-2">
					<span className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
						Note
					</span>
					<div className="flex flex-wrap gap-1 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-1 shadow-inner">
						{CHROMATIC_NOTES.map((note) => (
							<button
								key={note}
								type="button"
								onClick={() => handleNoteChange(note)}
								className={`min-w-[28px] rounded-md px-2 py-1.5 text-[11px] font-bold transition-all ${
									selectedNote === note
										? "bg-[var(--gb-accent)] text-white shadow-sm"
										: "text-[var(--gb-text-muted)] hover:bg-[var(--gb-bg-elev)] hover:text-[var(--gb-text)]"
								}`}
							>
								{note}
							</button>
						))}
					</div>
				</div>
			</section>

			{/* ── Section 2: Visualization Area ── */}
			<section className="space-y-5 rounded-[24px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 shadow-[var(--gb-shadow)]">
				<div>
					<p className="gb-page-kicker mb-1">Visualization</p>
					<h2 className="text-3xl font-semibold text-[var(--gb-text)]">
						{isPlaying ? `Listening to ${selectedNote}` : `${selectedNote} across the neck`}
					</h2>
					<p className="mt-2 max-w-2xl text-sm text-[var(--gb-text-muted)]">
						{isPlaying
							? `Playing position ${positionIndex + 1} of ${positions.length}. Watch and listen as each occurrence lights up.`
							: "Press Play to hear this note at every position on the fretboard, one by one."}
					</p>
				</div>

				<div className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4 md:p-5">
					<Fretboard
						fretRange={FRET_RANGE}
						mode="view"
						showNoteNames={true}
						targetPositions={allPositions}
						correctPositions={currentPosition ? [currentPosition] : []}
					/>
					<div className="mt-3 flex justify-center">
						<div className="w-48">
							<AudioEqualizer />
						</div>
					</div>
				</div>

				<hr className="border-[var(--gb-border)]" />

				<div className="flex flex-col items-center gap-3">
					<div className="flex items-center justify-center gap-3">
						{!isPlaying ? (
							<Button
								onClick={handleStart}
								variant="primary"
								className="relative min-w-[120px] border-b-4 border-b-green-800 bg-green-600 px-4 py-2.5 text-base font-bold hover:bg-green-700 active:translate-y-0.5 active:border-b-2"
								disabled={notePositions.length === 0}
							>
								Play
								<kbd className="absolute bottom-1 right-1.5 rounded bg-black/20 px-1 py-0.5 font-mono text-[9px] font-medium opacity-80">
									Space
								</kbd>
							</Button>
						) : (
							<Button
								onClick={handleStop}
								variant="secondary"
								className="relative min-w-[120px] border-b-4 border-b-red-800 bg-red-600 px-4 py-2.5 text-base font-bold text-white hover:bg-red-700 active:translate-y-0.5 active:border-b-2"
							>
								Stop
								<kbd className="absolute bottom-1 right-1.5 rounded bg-black/20 px-1 py-0.5 font-mono text-[9px] font-medium opacity-80">
									Space
								</kbd>
							</Button>
						)}
						{isPlaying && (
							<span className="flex items-center gap-1.5 rounded-full border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-2.5 py-0.5 text-xs font-semibold text-[var(--gb-text)]">
								{positionIndex + 1}/{positions.length}
							</span>
						)}
					</div>
					<KeyboardShortcutsBar items={shortcutItems} />
				</div>
			</section>
		</div>
	);
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { playFretPosition } from "@/lib/audio";
import { CHROMATIC_NOTES, getAllPositionsOfNote } from "@/lib/music";
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

	return (
		<div>
			<PageHeader
				kicker="Tone Meditation"
				title="Listen and Visualize"
				description="Hear a note played across all positions on the neck"
			/>

			<div className="mt-8">
				<span className="text-sm font-medium">Select a note:</span>
				<div className="mt-3 flex flex-wrap gap-2">
					{CHROMATIC_NOTES.map((note) => (
						<button
							key={note}
							type="button"
							onClick={() => handleNoteChange(note)}
							className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
								selectedNote === note
									? "bg-[var(--gb-accent)] text-white"
									: "bg-[var(--gb-bg-panel)] hover:bg-[var(--gb-bg-hover)]"
							}`}
						>
							{note}
						</button>
					))}
				</div>
			</div>

			<div className="mt-8 flex justify-center">
				<Fretboard
					fretRange={FRET_RANGE}
					mode="view"
					showNoteNames={true}
					targetPositions={allPositions}
					correctPositions={currentPosition ? [currentPosition] : []}
				/>
			</div>

			<div className="mt-8 flex justify-center gap-4">
				{!isPlaying ? (
					<Button onClick={handleStart} variant="primary" disabled={notePositions.length === 0}>
						▶ Play All Positions
					</Button>
				) : (
					<Button onClick={handleStop} variant="secondary">
						■ Stop
					</Button>
				)}
			</div>

			<div className="mx-auto mt-6 w-full max-w-md">
				<AudioEqualizer />
			</div>

			{isPlaying && (
				<p className="mt-4 text-center text-sm text-[var(--gb-text-muted)]">
					Playing position {positionIndex + 1} of {positions.length}
				</p>
			)}

			<div className="mt-8 border-t border-[var(--gb-border)] pt-6">
				<p className="text-sm text-[var(--gb-text-muted)]">
					The note <strong>{selectedNote}</strong> appears in {notePositions.length} positions on
					the fretboard
				</p>
			</div>
		</div>
	);
}

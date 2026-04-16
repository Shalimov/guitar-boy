import { useCallback, useEffect, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { Button, KeyboardShortcutsBar, NoteSelectionGrid } from "@/components/ui";
import { playFretPosition } from "@/lib/audio";
import { getNoteAtFret } from "@/lib/music";
import {
	buildNoteShortcutItems,
	FLAT_KEY_DISPLAY,
	getNoteFromKeyEvent,
	NATURAL_KEY_DISPLAY,
	SHARP_KEY_DISPLAY,
} from "@/lib/shortcuts";
import type { FretPosition } from "@/types";

interface EarTrainingSegmentViewProps {
	rounds: number;
	onComplete: (correct: number, total: number) => void;
}

const ALL_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const ENHARMONICS: Record<string, string> = {
	"C#": "Db",
	Db: "C#",
	"D#": "Eb",
	Eb: "D#",
	"F#": "Gb",
	Gb: "F#",
	"G#": "Ab",
	Ab: "G#",
	"A#": "Bb",
	Bb: "A#",
};

function isEnharmonicMatch(a: string, b: string): boolean {
	return a === b || ENHARMONICS[a] === b;
}

const NOTE_GROUPS = [
	{ label: "Natural Notes", notes: ["A", "B", "C", "D", "E", "F", "G"] },
	{ label: "Sharps (Ctrl)", notes: ["A#", "C#", "D#", "F#", "G#"] },
	{ label: "Flats (Shift)", notes: ["Bb", "Db", "Eb", "Gb", "Ab"] },
];

export function EarTrainingSegmentView({ rounds, onComplete }: EarTrainingSegmentViewProps) {
	const [roundIndex, setRoundIndex] = useState(0);
	const [correctCount, setCorrectCount] = useState(0);
	const [currentPosition, setCurrentPosition] = useState<FretPosition | null>(null);
	const [targetNote, setTargetNote] = useState<string | null>(null);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<boolean | null>(null);

	const generateRound = useCallback(() => {
		const string = Math.floor(Math.random() * 6);
		const fret = Math.floor(Math.random() * 13);
		const pos = { string, fret };
		const note = getNoteAtFret(pos).split("/")[0];
		setCurrentPosition(pos);
		setTargetNote(note);
		setSelectedNote(null);
		setFeedback(null);
		void playFretPosition(pos, "2n");
	}, []);

	useEffect(() => {
		generateRound();
	}, [generateRound]);

	const handleNoteSelect = useCallback(
		(note: string) => {
			if (feedback !== null) return;
			setSelectedNote(note);
			const isCorrect = isEnharmonicMatch(note, targetNote ?? "");
			setFeedback(isCorrect);
			if (isCorrect) setCorrectCount((prev) => prev + 1);
		},
		[feedback, targetNote],
	);

	const handleContinue = useCallback(() => {
		if (roundIndex === rounds - 1) {
			onComplete(correctCount, rounds);
		} else {
			setRoundIndex((prev) => prev + 1);
			generateRound();
		}
	}, [roundIndex, rounds, correctCount, onComplete, generateRound]);

	const handleReplay = useCallback(() => {
		if (currentPosition) {
			void playFretPosition(currentPosition, "2n");
		}
	}, [currentPosition]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
				return;
			}

			const note = getNoteFromKeyEvent(event, true);

			if (note && ALL_NOTES.includes(note) && !feedback) {
				handleNoteSelect(note);
				return;
			}

			if (event.key === " ") {
				event.preventDefault();
				void handleReplay();
				return;
			}

			if ((event.key === "Enter" || event.key === "n" || event.key === "N") && feedback) {
				event.preventDefault();
				handleContinue();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [feedback, handleNoteSelect, handleContinue, handleReplay]);

	const keyDisplayMap = { ...NATURAL_KEY_DISPLAY, ...SHARP_KEY_DISPLAY, ...FLAT_KEY_DISPLAY };
	const shortcutItems = buildNoteShortcutItems({
		notes: ALL_NOTES,
		keyDisplayMap,
		includeSpaceAction: "replay",
		includeEnterAction: "next",
	});

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-accent)]">
						Step 3: Ear Training
					</h3>
					<span className="text-xs font-medium text-[var(--gb-text-muted)]">
						Round {roundIndex + 1} of {rounds}
					</span>
				</div>

				<div className="gb-panel p-6 shadow-[var(--gb-shadow-soft)] space-y-6 text-center">
					<div className="space-y-2">
						<p className="text-sm font-medium text-[var(--gb-text-muted)]">
							Listen to the note and identify it
						</p>
						<Button onClick={handleReplay} variant="secondary">
							🔊 Replay Note
						</Button>
					</div>

					<KeyboardShortcutsBar items={shortcutItems} className="mb-3" />

					<NoteSelectionGrid
						groups={NOTE_GROUPS}
						selectedNote={selectedNote}
						correctNote={
							feedback !== null && selectedNote && isEnharmonicMatch(selectedNote, targetNote ?? "")
								? selectedNote
								: targetNote
						}
						revealed={feedback !== null}
						onSelect={handleNoteSelect}
						disabled={feedback !== null}
						variant="class"
						buttonClassName="py-3 px-4 rounded-lg font-bold border transition-all"
					/>

					{feedback !== null && (
						<div className="pt-4 border-t border-[var(--gb-border)] animate-gb-slide-up animate-gb-duration-300">
							<p className={`text-lg font-bold ${feedback ? "text-green-600" : "text-red-600"}`}>
								{feedback ? "Perfect!" : `Almost. It was ${targetNote}`}
							</p>
							<div className="mt-4 max-w-sm mx-auto">
								<Fretboard
									mode="view"
									state={
										currentPosition && targetNote
											? {
													dots: [
														{
															position: currentPosition,
															shape: "circle",
															color: "var(--gb-accent)",
															label: targetNote,
														},
													],
													lines: [],
												}
											: { dots: [], lines: [] }
									}
									fretRange={[0, 12]}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="flex justify-end">
				{feedback !== null && (
					<Button onClick={handleContinue}>
						{roundIndex === rounds - 1 ? "Finish Session" : "Next Round"}
					</Button>
				)}
			</div>
		</div>
	);
}

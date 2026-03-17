import { useCallback, useEffect, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { Button, NoteButtonGroup } from "@/components/ui";
import { KeyboardShortcutsBar } from "@/components/ui/KeyboardShortcutsBar";
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

export function EarTrainingSegmentView({ rounds, onComplete }: EarTrainingSegmentViewProps) {
	const [roundIndex, setRoundIndex] = useState(0);
	const [correctCount, setCorrectCount] = useState(0);
	const [currentPosition, setCurrentPosition] = useState<FretPosition | null>(null);
	const [targetNote, setTargetNote] = useState<string | null>(null);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<boolean | null>(null);

	const generateRound = useCallback(() => {
		const string = Math.floor(Math.random() * 6);
		const fret = Math.floor(Math.random() * 13); // 0-12 for full chromatic range
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
			const isCorrect = note === targetNote;
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

					<div className="space-y-4">
						<NoteButtonGroup label="Natural Notes">
							{["A", "B", "C", "D", "E", "F", "G"].map((note) => {
								const isSelected = selectedNote === note;
								const isCorrectNote = targetNote && note === targetNote;
								const isWrong = isSelected && !isCorrectNote;

								let buttonStyle = "";
								if (feedback && isCorrectNote) {
									buttonStyle = "bg-green-600 text-white border-transparent";
								} else if (isWrong) {
									buttonStyle = "bg-red-600 text-white border-transparent";
								} else if (isSelected) {
									buttonStyle = "bg-[var(--gb-accent)] text-white border-transparent";
								} else {
									buttonStyle =
										"bg-[var(--gb-bg-panel)] text-[var(--gb-text)] border-[var(--gb-border)]";
								}

								return (
									<button
										key={note}
										type="button"
										onClick={() => handleNoteSelect(note)}
										disabled={feedback !== null}
										className={`py-3 px-4 rounded-lg font-bold border transition-all ${buttonStyle} ${
											feedback ? "cursor-not-allowed" : "hover:opacity-90 active:scale-95"
										}`}
									>
										{note}
									</button>
								);
							})}
						</NoteButtonGroup>

						<NoteButtonGroup label="Sharps (Ctrl)">
							{["A#", "C#", "D#", "F#", "G#"].map((note) => {
								const isSelected = selectedNote === note;
								const isCorrectNote = targetNote && note === targetNote;
								const isWrong = isSelected && !isCorrectNote;

								let buttonStyle = "";
								if (feedback && isCorrectNote) {
									buttonStyle = "bg-green-600 text-white border-transparent";
								} else if (isWrong) {
									buttonStyle = "bg-red-600 text-white border-transparent";
								} else if (isSelected) {
									buttonStyle = "bg-[var(--gb-accent)] text-white border-transparent";
								} else {
									buttonStyle =
										"bg-[var(--gb-bg-panel)] text-[var(--gb-text)] border-[var(--gb-border)]";
								}

								return (
									<button
										key={note}
										type="button"
										onClick={() => handleNoteSelect(note)}
										disabled={feedback !== null}
										className={`py-3 px-4 rounded-lg font-bold border transition-all ${buttonStyle} ${
											feedback ? "cursor-not-allowed" : "hover:opacity-90 active:scale-95"
										}`}
									>
										{note}
									</button>
								);
							})}
						</NoteButtonGroup>

						<NoteButtonGroup label="Flats (Shift)">
							{["Bb", "Db", "Eb", "Gb", "Ab"].map((note) => {
								const isSelected = selectedNote === note;
								const isCorrectNote = targetNote && note === targetNote;
								const isWrong = isSelected && !isCorrectNote;

								let buttonStyle = "";
								if (feedback && isCorrectNote) {
									buttonStyle = "bg-green-600 text-white border-transparent";
								} else if (isWrong) {
									buttonStyle = "bg-red-600 text-white border-transparent";
								} else if (isSelected) {
									buttonStyle = "bg-[var(--gb-accent)] text-white border-transparent";
								} else {
									buttonStyle =
										"bg-[var(--gb-bg-panel)] text-[var(--gb-text)] border-[var(--gb-border)]";
								}

								return (
									<button
										key={note}
										type="button"
										onClick={() => handleNoteSelect(note)}
										disabled={feedback !== null}
										className={`py-3 px-4 rounded-lg font-bold border transition-all ${buttonStyle} ${
											feedback ? "cursor-not-allowed" : "hover:opacity-90 active:scale-95"
										}`}
									>
										{note}
									</button>
								);
							})}
						</NoteButtonGroup>
					</div>

					{feedback !== null && (
						<div className="pt-4 border-t border-[var(--gb-border)]">
							<p className={`text-lg font-bold ${feedback ? "text-green-600" : "text-red-600"}`}>
								{feedback ? "Perfect!" : `Almost. It was ${targetNote}`}
							</p>
							<div className="mt-4 max-w-sm mx-auto">
								<Fretboard
									mode="view"
									state={{
										dots:
											currentPosition && targetNote
												? [
														{
															position: currentPosition,
															shape: "circle",
															color: "var(--gb-accent)",
															label: targetNote,
														},
													]
												: [],
										lines: [],
									}}
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

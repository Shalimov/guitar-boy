import { useCallback, useEffect, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { Button } from "@/components/ui/Button";
import { playFretPosition } from "@/lib/audio";
import { getNoteAtFret } from "@/lib/music";
import type { FretPosition } from "@/types";

interface EarTrainingSegmentViewProps {
	rounds: number;
	onComplete: (correct: number, total: number) => void;
}

const NOTES = ["C", "D", "E", "F", "G", "A", "B"];

export function EarTrainingSegmentView({ rounds, onComplete }: EarTrainingSegmentViewProps) {
	const [roundIndex, setRoundIndex] = useState(0);
	const [correctCount, setCorrectCount] = useState(0);
	const [currentPosition, setCurrentPosition] = useState<FretPosition | null>(null);
	const [targetNote, setTargetNote] = useState<string | null>(null);
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<boolean | null>(null);

	const generateRound = useCallback(() => {
		const string = Math.floor(Math.random() * 6);
		const fret = Math.floor(Math.random() * 6); // Keep it easy: 0-5
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

	const handleNoteSelect = (note: string) => {
		if (feedback !== null) return;
		setSelectedNote(note);
		const isCorrect = note === targetNote;
		setFeedback(isCorrect);
		if (isCorrect) setCorrectCount((prev) => prev + 1);
	};

	const handleContinue = () => {
		if (roundIndex === rounds - 1) {
			onComplete(correctCount, rounds);
		} else {
			setRoundIndex((prev) => prev + 1);
			generateRound();
		}
	};

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
						<Button
							onClick={() => currentPosition && playFretPosition(currentPosition, "2n")}
							variant="secondary"
						>
							🔊 Replay Note
						</Button>
					</div>

					<div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
						{NOTES.map((note) => (
							<button
								key={note}
								type="button"
								onClick={() => handleNoteSelect(note)}
								className={`py-3 rounded-lg font-bold border transition-all ${
									selectedNote === note
										? feedback
											? "bg-green-600 text-white border-transparent"
											: feedback === false
												? "bg-red-600 text-white border-transparent"
												: "bg-[var(--gb-accent)] text-white border-transparent"
										: "bg-[var(--gb-bg-panel)] text-[var(--gb-text)] border-[var(--gb-border)]"
								}`}
							>
								{note}
							</button>
						))}
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
									fretRange={[0, 5]}
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

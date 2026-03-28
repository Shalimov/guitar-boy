import { useCallback, useEffect, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { Button } from "@/components/ui/Button";
import { playFretPosition } from "@/lib/audio";
import type { FretPosition } from "@/types";
import type { FollowUp } from "./followUp";

interface FollowUpPromptProps {
	followUp: FollowUp;
	onComplete: (correct: boolean) => void;
	onSkip: () => void;
}

export function FollowUpPrompt({ followUp, onComplete, onSkip }: FollowUpPromptProps) {
	const [selectedNote, setSelectedNote] = useState<string | null>(null);
	const [selectedPosition, setSelectedPosition] = useState<FretPosition | null>(null);
	const [feedback, setFeedback] = useState<boolean | null>(null);

	const handlePlay = useCallback(() => {
		if (followUp.type === "ear-check") {
			void playFretPosition(followUp.playPosition, "2n");
		}
	}, [followUp]);

	useEffect(() => {
		if (followUp.type === "ear-check") {
			handlePlay();
		}
	}, [followUp, handlePlay]);

	useEffect(() => {
		if (followUp.type !== "ear-check") return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
				return;
			if (event.key === " ") {
				event.preventDefault();
				handlePlay();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [followUp.type, handlePlay]);

	const handleNoteSelect = (note: string) => {
		if (followUp.type !== "ear-check" || feedback !== null) return;
		setSelectedNote(note);
		const isCorrect = note === followUp.targetNote;
		setFeedback(isCorrect);
		setTimeout(() => onComplete(isCorrect), 1200);
	};

	const handleFretClick = (pos: FretPosition) => {
		if (followUp.type !== "fretboard-locate" || feedback !== null) return;
		setSelectedPosition(pos);
		const isCorrect = followUp.validPositions.some(
			(p) => p.string === pos.string && p.fret === pos.fret,
		);
		setFeedback(isCorrect);
		setTimeout(() => onComplete(isCorrect), 1200);
	};

	return (
		<div className="rounded-2xl border-2 border-dashed border-[var(--gb-accent)]/30 p-6 bg-[color-mix(in_srgb,var(--gb-accent-soft)_8%,var(--gb-bg-elev))] animate-in fade-in slide-in-from-bottom-2 duration-300">
			<div className="mb-4 flex items-center justify-between">
				<span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gb-accent)] bg-[var(--gb-accent)]/10 px-2 py-0.5 rounded">
					Bonus Round: Deep Practice
				</span>
				<button
					type="button"
					onClick={onSkip}
					className="text-xs font-semibold transition-colors hover:opacity-75"
					style={{ color: "var(--gb-text-muted)" }}
				>
					Skip
				</button>
			</div>

			{followUp.type === "ear-check" ? (
				<div className="space-y-6 text-center">
					<div className="space-y-2">
						<h3 className="text-lg font-bold">Listen carefully...</h3>
						<p className="text-sm text-[var(--gb-text-muted)]">
							Which note did you just play correctly?
						</p>
					</div>

					<div className="flex justify-center">
						<Button onClick={handlePlay} variant="secondary" className="gap-2">
							<span>🔊</span> Replay Note
						</Button>
					</div>

					<div className="mx-auto max-w-md">
						<AudioEqualizer />
					</div>

					<div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
						{followUp.noteOptions.map((note) => (
							<button
								key={note}
								type="button"
								onClick={() => handleNoteSelect(note)}
								className={`py-3 rounded-lg font-bold border transition-all ${
									selectedNote === note
										? feedback
											? "bg-green-600 text-white border-transparent"
											: "bg-red-600 text-white border-transparent"
										: "bg-[var(--gb-bg-panel)] text-[var(--gb-text)] border-[var(--gb-border)]"
								}`}
							>
								{note}
							</button>
						))}
					</div>
				</div>
			) : (
				<div className="space-y-6 text-center">
					<div className="space-y-2">
						<h3 className="text-lg font-bold">Now locate it...</h3>
						<p className="text-sm text-[var(--gb-text-muted)]">
							Find{" "}
							<span className="text-[var(--gb-accent-strong)] font-black">
								{followUp.targetNote}
							</span>{" "}
							anywhere on the fretboard.
						</p>
					</div>

					<div className="max-w-xl mx-auto">
						<Fretboard
							mode="test"
							onFretClick={handleFretClick}
							state={{
								dots: selectedPosition
									? [
											{
												position: selectedPosition,
												shape: "circle",
												color: feedback ? "var(--gb-accent)" : "#ef4444",
											},
										]
									: [],
								lines: [],
							}}
							fretRange={followUp.fretRange}
						/>
					</div>
				</div>
			)}

			{feedback !== null && (
				<div className="mt-6 animate-in fade-in zoom-in duration-300">
					<p className={`text-xl font-black ${feedback ? "text-green-600" : "text-red-600"}`}>
						{feedback ? "Double Perfect!" : "Nice try!"}
					</p>
				</div>
			)}
		</div>
	);
}

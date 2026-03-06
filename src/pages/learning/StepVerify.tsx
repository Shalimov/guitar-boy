import { useEffect, useRef, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import type { VerifyStep as VerifyStepType } from "@/types/lesson";
import type { FretPosition } from "@/types/music";

interface StepVerifyProps {
	step: VerifyStepType;
	onComplete: () => void;
}

export function StepVerify({ step, onComplete }: StepVerifyProps) {
	const [selectedPositions, setSelectedPositions] = useState<FretPosition[]>([]);
	const [feedback, setFeedback] = useState<{
		correct: FretPosition[];
		incorrect: FretPosition[];
		missed: FretPosition[];
	}>({ correct: [], incorrect: [], missed: [] });
	const [isVerified, setIsVerified] = useState(false);
	const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Cancel any pending auto-advance timer when the component unmounts
	useEffect(() => {
		return () => {
			if (completeTimerRef.current !== null) {
				clearTimeout(completeTimerRef.current);
			}
		};
	}, []);

	const handleFretClick = (position: FretPosition) => {
		if (isVerified) return;
		setSelectedPositions((prev) => {
			const isSelected = prev.some(
				(pos) => pos.string === position.string && pos.fret === position.fret,
			);
			if (isSelected) {
				return prev.filter(
					(pos) => !(pos.string === position.string && pos.fret === position.fret),
				);
			}
			return [...prev, position];
		});
	};

	const handleCheck = () => {
		const correct: FretPosition[] = [];
		const incorrect: FretPosition[] = [];
		const missed: FretPosition[] = [];

		for (const target of step.targetPositions) {
			const wasSelected = selectedPositions.some(
				(pos) => pos.string === target.string && pos.fret === target.fret,
			);
			if (wasSelected) correct.push(target);
			else missed.push(target);
		}

		for (const selected of selectedPositions) {
			const isTarget = step.targetPositions.some(
				(target) => target.string === selected.string && target.fret === selected.fret,
			);
			if (!isTarget) incorrect.push(selected);
		}

		setFeedback({ correct, incorrect, missed });
		setIsVerified(true);

		if (incorrect.length === 0 && missed.length === 0) {
			completeTimerRef.current = setTimeout(() => onComplete(), 1500);
		}
	};

	const isPerfect = isVerified && feedback.incorrect.length === 0 && feedback.missed.length === 0;

	return (
		<div className="space-y-4">
			<p className="text-base font-medium" style={{ color: "var(--gb-text)" }}>
				{step.instruction}
			</p>

			<div
				className="p-4 rounded-xl"
				style={{ background: "var(--gb-bg-panel)", border: "1px solid var(--gb-border)" }}
			>
				<Fretboard
					mode="test"
					state={step.fretboardState || { dots: [], lines: [] }}
					fretRange={[0, 5]}
					targetPositions={step.targetPositions}
					selectedPositions={selectedPositions}
					correctPositions={feedback.correct}
					incorrectPositions={feedback.incorrect}
					missedPositions={feedback.missed}
					onFretClick={handleFretClick}
					playAudioOnFretClick
					showNoteNames
					showStringLabels={false}
				/>
				<p className="mt-3 text-xs" style={{ color: "var(--gb-text-muted)" }}>
					Tap a marked fret to hear the note you are checking.
				</p>
			</div>

			{!isVerified ? (
				<button
					type="button"
					onClick={handleCheck}
					disabled={selectedPositions.length === 0}
					style={
						selectedPositions.length === 0
							? {
									background: "var(--gb-bg-tab)",
									color: "var(--gb-text-muted)",
									cursor: "not-allowed",
								}
							: {
									background: "var(--gb-accent)",
									color: "#fff8ee",
									boxShadow: "0 2px 8px rgba(179,93,42,0.28)",
								}
					}
					className="px-6 py-2 rounded-full font-medium text-sm transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none"
				>
					Check Answer
				</button>
			) : isPerfect ? (
				<div
					className="p-4 rounded-xl flex items-center gap-3"
					style={{
						background: "color-mix(in srgb, #16a34a 12%, var(--gb-bg-elev))",
						border: "1px solid color-mix(in srgb, #16a34a 30%, var(--gb-border))",
					}}
				>
					<span className="text-lg">✓</span>
					<p className="text-sm font-semibold" style={{ color: "#166534" }}>
						Perfect! All positions correct.
					</p>
				</div>
			) : (
				<div
					className="p-4 rounded-xl space-y-3"
					style={{
						background: "color-mix(in srgb, #ca8a04 10%, var(--gb-bg-elev))",
						border: "1px solid color-mix(in srgb, #ca8a04 30%, var(--gb-border))",
					}}
				>
					<p className="text-sm font-medium" style={{ color: "#854d0e" }}>
						Almost there! Missed {feedback.missed.length} position(s), {feedback.incorrect.length}{" "}
						incorrect.
					</p>
					<button
						type="button"
						onClick={() => {
							setSelectedPositions([]);
							setFeedback({ correct: [], incorrect: [], missed: [] });
							setIsVerified(false);
						}}
						style={{ background: "var(--gb-accent)", color: "#fff8ee" }}
						className="px-4 py-1.5 rounded-full font-medium text-sm transition-all hover:opacity-90 focus-visible:outline-none"
					>
						Try Again
					</button>
				</div>
			)}
		</div>
	);
}

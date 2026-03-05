import { useState } from "react";
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
			if (wasSelected) {
				correct.push(target);
			} else {
				missed.push(target);
			}
		}

		for (const selected of selectedPositions) {
			const isTarget = step.targetPositions.some(
				(target) => target.string === selected.string && target.fret === selected.fret,
			);
			if (!isTarget) {
				incorrect.push(selected);
			}
		}

		setFeedback({ correct, incorrect, missed });
		setIsVerified(true);

		if (incorrect.length === 0 && missed.length === 0) {
			setTimeout(() => {
				onComplete();
			}, 1500);
		}
	};

	return (
		<div className="space-y-4">
			<p className="text-lg font-medium text-gray-900">{step.instruction}</p>

			<div className="p-4 bg-gray-50 rounded-lg">
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
					showNoteNames
				/>
			</div>

			{!isVerified ? (
				<button
					type="button"
					onClick={handleCheck}
					disabled={selectedPositions.length === 0}
					className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
				>
					Check Answer
				</button>
			) : feedback.incorrect.length === 0 && feedback.missed.length === 0 ? (
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
					<p className="text-green-700 font-medium">✓ Perfect! All positions correct.</p>
				</div>
			) : (
				<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p className="text-yellow-700 font-medium">
						Almost there! You missed {feedback.missed.length} position(s) and selected{" "}
						{feedback.incorrect.length} incorrect position(s).
					</p>
					<button
						type="button"
						onClick={() => {
							setSelectedPositions([]);
							setFeedback({ correct: [], incorrect: [], missed: [] });
							setIsVerified(false);
						}}
						className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
					>
						Try Again
					</button>
				</div>
			)}
		</div>
	);
}

import { useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui/Button";
import type { FretPosition } from "@/types";
import type { TeachBackStep } from "@/types/lesson";

interface StepTeachBackProps {
	step: TeachBackStep;
	onComplete: () => void;
}

interface UserLabel {
	position: FretPosition;
	label: string;
}

export function StepTeachBack({ step, onComplete }: StepTeachBackProps) {
	const [selectedPosition, setSelectedPosition] = useState<FretPosition | null>(null);
	const [userLabels, setUserLabels] = useState<UserLabel[]>([]);
	const [feedback, setFeedback] = useState<null | {
		correct: UserLabel[];
		incorrect: UserLabel[];
		missed: typeof step.expectedLabels;
	}>(null);

	const handleFretClick = (position: FretPosition) => {
		if (feedback) return;
		setSelectedPosition(position);
	};

	const handleLabelSubmit = (label: string) => {
		if (!selectedPosition) return;
		setUserLabels((prev) => [
			...prev.filter(
				(l) =>
					!(
						l.position.string === selectedPosition.string &&
						l.position.fret === selectedPosition.fret
					),
			),
			{ position: selectedPosition, label },
		]);
		setSelectedPosition(null);
	};

	const handleCheck = () => {
		const correct: UserLabel[] = [];
		const incorrect: UserLabel[] = [];
		const matched = new Set<number>();

		for (const userLabel of userLabels) {
			const matchIdx = step.expectedLabels.findIndex(
				(exp, idx) =>
					!matched.has(idx) &&
					exp.position.string === userLabel.position.string &&
					exp.position.fret === userLabel.position.fret &&
					exp.label.toLowerCase() === userLabel.label.toLowerCase(),
			);
			if (matchIdx >= 0) {
				correct.push(userLabel);
				matched.add(matchIdx);
			} else {
				incorrect.push(userLabel);
			}
		}

		const missed = step.expectedLabels.filter((_, idx) => !matched.has(idx));
		setFeedback({ correct, incorrect, missed });
	};

	return (
		<div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
			<div>
				<p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gb-accent-strong)]">
					🎓 Recall Challenge
				</p>
				<p className="mt-2 text-lg font-medium text-[var(--gb-text)] leading-relaxed">
					{step.instruction}
				</p>
			</div>

			<div className="rounded-2xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)]/50 p-4 shadow-sm">
				<Fretboard
					mode="test"
					state={{
						dots: userLabels.map((ul) => ({
							position: ul.position,
							shape: "circle" as const,
							label: ul.label,
							color: feedback
								? feedback.correct.some(
										(c) =>
											c.position.string === ul.position.string &&
											c.position.fret === ul.position.fret,
									)
									? "#16a34a"
									: "#dc2626"
								: "var(--gb-accent)",
						})),
						lines: step.fretboardState?.lines || [],
					}}
					onFretClick={handleFretClick}
					showNoteNames={!!feedback}
					showStringLabels
					fretRange={[0, 15]}
				/>
			</div>

			{selectedPosition && !feedback && (
				<div className="gb-panel p-5 space-y-4 border-2 border-[var(--gb-accent-soft)] animate-in zoom-in-95 duration-200">
					<p className="text-xs font-bold text-[var(--gb-text-muted)] uppercase tracking-wider">
						Select label for String {selectedPosition.string + 1}, Fret {selectedPosition.fret}:
					</p>
					<div className="flex flex-wrap gap-2">
						{["C", "D", "E", "F", "G", "A", "B"].map((note) => (
							<button
								key={note}
								type="button"
								onClick={() => handleLabelSubmit(note)}
								className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] h-12 w-12 flex items-center justify-center font-black text-lg text-[var(--gb-text)] hover:bg-[var(--gb-accent-soft)] hover:border-[var(--gb-accent)] transition-all active:scale-95"
							>
								{note}
							</button>
						))}
						<button
							type="button"
							onClick={() => setSelectedPosition(null)}
							className="rounded-xl border border-[var(--gb-border)] px-4 font-bold text-sm text-[var(--gb-text-muted)] hover:bg-[var(--gb-bg-elev)]"
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{feedback && (
				<div
					className={`p-5 rounded-2xl border ${
						feedback.missed.length === 0 && feedback.incorrect.length === 0
							? "bg-green-500/10 border-green-500/30 text-green-900"
							: "bg-amber-500/10 border-amber-500/30 text-amber-900"
					}`}
				>
					<h4 className="font-black flex items-center gap-2">
						{feedback.missed.length === 0 && feedback.incorrect.length === 0
							? "✨ Perfect Recall!"
							: "📝 Review Results"}
					</h4>
					<p className="mt-1 text-sm font-medium">
						You correctly identified {feedback.correct.length} out of {step.expectedLabels.length}{" "}
						positions.
					</p>
					{feedback.missed.length > 0 && (
						<div className="mt-3 bg-white/50 rounded-xl p-3 border border-current/10">
							<p className="text-xs font-bold uppercase tracking-wider opacity-70">Missing:</p>
							<p className="text-sm font-bold">
								{feedback.missed
									.map((m) => `${m.label} (S${m.position.string + 1} F${m.position.fret})`)
									.join(", ")}
							</p>
						</div>
					)}
				</div>
			)}

			<div className="flex gap-3">
				{!feedback ? (
					<Button
						onClick={handleCheck}
						disabled={userLabels.length === 0}
						className="px-8 flex-1 sm:flex-none"
					>
						Check labels
					</Button>
				) : (
					<Button onClick={onComplete} className="px-8 flex-1 sm:flex-none">
						Continue
					</Button>
				)}
			</div>
		</div>
	);
}

import type { FretPosition } from "@/types";

interface QuizFeedbackProps {
	isCorrect: boolean;
	message?: string;
	correctPositions: FretPosition[];
	missedPositions?: FretPosition[];
	incorrectPositions?: FretPosition[];
	onContinue: () => void;
}

export function QuizFeedback({
	isCorrect,
	message,
	correctPositions,
	missedPositions = [],
	incorrectPositions = [],
	onContinue,
}: QuizFeedbackProps) {
	return (
		<div
			className="rounded-xl p-5 space-y-4"
			style={{
				background: isCorrect
					? "color-mix(in srgb, #16a34a 10%, var(--gb-bg-elev))"
					: "color-mix(in srgb, #dc2626 10%, var(--gb-bg-elev))",
				border: `1px solid ${isCorrect ? "color-mix(in srgb, #16a34a 30%, var(--gb-border))" : "color-mix(in srgb, #dc2626 30%, var(--gb-border))"}`,
			}}
		>
			<div className="flex items-start gap-3">
				<span className="text-2xl leading-none mt-0.5">{isCorrect ? "✓" : "✗"}</span>
				<div className="flex-1 space-y-2">
					<h3 className="font-bold text-base" style={{ color: isCorrect ? "#166534" : "#991b1b" }}>
						{isCorrect ? "Correct!" : "Incorrect"}
					</h3>

					{message && (
						<p className="text-sm" style={{ color: "var(--gb-text-muted)" }}>
							{message}
						</p>
					)}

					{!isCorrect && correctPositions.length > 0 && (
						<div>
							<p className="text-xs font-semibold mb-1" style={{ color: "#166534" }}>
								Correct positions:
							</p>
							<ul className="text-xs space-y-0.5" style={{ color: "var(--gb-text)" }}>
								{correctPositions.map((pos) => (
									<li key={`${pos.string}-${pos.fret}`}>
										String {pos.string + 1}, Fret {pos.fret}
									</li>
								))}
							</ul>
						</div>
					)}

					{missedPositions.length > 0 && (
						<div>
							<p className="text-xs font-semibold mb-1" style={{ color: "#854d0e" }}>
								Missed positions:
							</p>
							<ul className="text-xs space-y-0.5" style={{ color: "var(--gb-text)" }}>
								{missedPositions.map((pos) => (
									<li key={`missed-${pos.string}-${pos.fret}`}>
										String {pos.string + 1}, Fret {pos.fret}
									</li>
								))}
							</ul>
						</div>
					)}

					{incorrectPositions.length > 0 && (
						<div>
							<p className="text-xs font-semibold mb-1" style={{ color: "#991b1b" }}>
								Incorrect positions:
							</p>
							<ul className="text-xs space-y-0.5" style={{ color: "var(--gb-text)" }}>
								{incorrectPositions.map((pos) => (
									<li key={`incorrect-${pos.string}-${pos.fret}`}>
										String {pos.string + 1}, Fret {pos.fret}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>

			<div className="flex justify-end">
				<button
					type="button"
					onClick={onContinue}
					style={{
						background: "var(--gb-accent)",
						color: "#fff8ee",
						boxShadow: "0 2px 8px rgba(179,93,42,0.28)",
					}}
					className="px-6 py-2 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none"
				>
					Continue
				</button>
			</div>
		</div>
	);
}

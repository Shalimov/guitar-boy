interface SessionSummaryProps {
	totalQuestions: number;
	correctCount: number;
	durationMs: number;
	onReviewAgain: () => void;
	onReturnToDashboard: () => void;
}

export function SessionSummary({
	totalQuestions,
	correctCount,
	durationMs,
	onReviewAgain,
	onReturnToDashboard,
}: SessionSummaryProps) {
	const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
	const durationSeconds = Math.round(durationMs / 1000);
	const minutes = Math.floor(durationSeconds / 60);
	const seconds = durationSeconds % 60;

	const accuracyColor = accuracy >= 80 ? "#16a34a" : accuracy >= 60 ? "#ca8a04" : "#dc2626";
	const feedbackText =
		accuracy >= 80
			? "Excellent work! Keep it up!"
			: accuracy >= 60
				? "Good progress! Keep practicing."
				: "Keep practicing to improve your score.";

	return (
		<div className="max-w-2xl mx-auto p-6 animate-gb-zoom-in animate-gb-duration-500">
			<div
				className="rounded-2xl p-8 space-y-8"
				style={{
					background: "var(--gb-bg-elev)",
					border: "1px solid var(--gb-border)",
					boxShadow: "var(--gb-shadow)",
				}}
			>
				{/* Title */}
				<div className="text-center">
					<p className="gb-page-kicker mb-1">Results</p>
					<h1 className="gb-page-title">Quiz Complete!</h1>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4">
					{[
						{ value: correctCount, label: "Correct", color: "var(--gb-accent)" },
						{ value: `${accuracy.toFixed(0)}%`, label: "Accuracy", color: accuracyColor },
						{
							value: `${minutes}:${seconds.toString().padStart(2, "0")}`,
							label: "Duration",
							color: "var(--gb-text)",
						},
					].map(({ value, label, color }) => (
						<div
							key={label}
							className="text-center py-5 rounded-xl"
							style={{ background: "var(--gb-bg-panel)", border: "1px solid var(--gb-border)" }}
						>
							<div className="text-3xl font-extrabold" style={{ color }}>
								{value}
							</div>
							<div className="text-xs mt-1 font-medium" style={{ color: "var(--gb-text-muted)" }}>
								{label}
							</div>
						</div>
					))}
				</div>

				{/* Accuracy bar */}
				<div className="space-y-2">
					<div
						className="h-3 rounded-full overflow-hidden"
						style={{ background: "var(--gb-bg-panel)" }}
					>
						<div
							className="h-full rounded-full transition-all duration-700"
							style={{ width: `${accuracy}%`, background: accuracyColor }}
						/>
					</div>
					<p className="text-center text-sm" style={{ color: "var(--gb-text-muted)" }}>
						{feedbackText}
					</p>
				</div>

				{/* Actions */}
				<div className="space-y-3">
					<button
						type="button"
						onClick={onReviewAgain}
						style={{
							background: "var(--gb-accent)",
							color: "#fff8ee",
							boxShadow: "0 4px 14px rgba(179,93,42,0.35)",
						}}
						className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] focus-visible:outline-none"
					>
						Try Again
					</button>
					<button
						type="button"
						onClick={onReturnToDashboard}
						style={{
							background: "var(--gb-bg-panel)",
							color: "var(--gb-text)",
							border: "1px solid var(--gb-border)",
						}}
						className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-80 focus-visible:outline-none"
					>
						Back to Quiz Setup
					</button>
				</div>
			</div>
		</div>
	);
}

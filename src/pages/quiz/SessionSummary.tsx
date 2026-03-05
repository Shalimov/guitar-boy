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

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="bg-white rounded-lg shadow-lg p-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Quiz Complete!</h1>

				<div className="grid grid-cols-3 gap-6 mb-8">
					<div className="text-center">
						<div className="text-4xl font-bold text-blue-600">{correctCount}</div>
						<div className="text-sm text-gray-600 mt-1">Correct</div>
					</div>
					<div className="text-center">
						<div className="text-4xl font-bold text-gray-900">{accuracy.toFixed(0)}%</div>
						<div className="text-sm text-gray-600 mt-1">Accuracy</div>
					</div>
					<div className="text-center">
						<div className="text-4xl font-bold text-gray-900">
							{minutes}:{seconds.toString().padStart(2, "0")}
						</div>
						<div className="text-sm text-gray-600 mt-1">Duration</div>
					</div>
				</div>

				<div className="mb-8">
					<div className="h-4 bg-gray-200 rounded-full overflow-hidden">
						<div
							className="h-full transition-all duration-500"
							style={{
								width: `${accuracy}%`,
								backgroundColor:
									accuracy >= 80 ? "#10B981" : accuracy >= 60 ? "#F59E0B" : "#EF4444",
							}}
						/>
					</div>
					<div className="text-center text-sm text-gray-600 mt-2">
						{accuracy >= 80
							? "Excellent work! Keep it up!"
							: accuracy >= 60
								? "Good progress! Keep practicing."
								: "Keep practicing to improve your score."}
					</div>
				</div>

				<div className="space-y-3">
					<button
						type="button"
						onClick={onReviewAgain}
						className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
					>
						Try Again
					</button>
					<button
						type="button"
						onClick={onReturnToDashboard}
						className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
					>
						Return to Dashboard
					</button>
				</div>
			</div>
		</div>
	);
}

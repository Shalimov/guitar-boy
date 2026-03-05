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
		<div className="mt-6 p-6 rounded-lg border-2">
			<div className="flex items-start gap-4">
				{isCorrect ? (
					<>
						<div className="flex-shrink-0 text-4xl">✗</div>
						<div className="flex-1">
							<h3 className="text-lg font-bold text-red-700">Incorrect</h3>
							<p className="text-sm text-gray-600 mt-1">
								{message ||
									`The correct position${correctPositions.length !== 1 ? "s were" : " was"}:`}
							</p>
							{correctPositions.length > 0 && (
								<div className="mt-2">
									<p className="text-xs font-medium text-green-700">Correct positions:</p>
									<ul className="mt-1 text-sm text-gray-700">
										{correctPositions.map((pos) => (
											<li key={`${pos.string}-${pos.fret}`}>
												String {pos.string + 1}, Fret {pos.fret}
											</li>
										))}
									</ul>
								</div>
							)}
							{missedPositions.length > 0 && (
								<div className="mt-2">
									<p className="text-xs font-medium text-yellow-700">Missed positions:</p>
									<ul className="mt-1 text-sm text-gray-700">
										{missedPositions.map((pos) => (
											<li key={`missed-${pos.string}-${pos.fret}`}>
												String {pos.string + 1}, Fret {pos.fret}
											</li>
										))}
									</ul>
								</div>
							)}
							{incorrectPositions.length > 0 && (
								<div className="mt-2">
									<p className="text-xs font-medium text-red-700">Incorrect positions:</p>
									<ul className="mt-1 text-sm text-gray-700">
										{incorrectPositions.map((pos) => (
											<li key={`incorrect-${pos.string}-${pos.fret}`}>
												String {pos.string + 1}, Fret {pos.fret}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</>
				) : (
					<>
						<div className="flex-shrink-0 text-4xl">✗</div>
						<div className="flex-1">
							<h3 className="text-lg font-bold text-red-700">Incorrect</h3>
							<p className="text-sm text-gray-600 mt-1">
								{message ||
									`The correct position${correctPositions.length !== 1 ? "s were" : " was"}:`}
							</p>
							{correctPositions.length > 0 && (
								<ul className="mt-2 text-sm text-gray-700">
									{correctPositions.map((pos) => (
										<li key={`${pos.string}-${pos.fret}`}>
											String {pos.string + 1}, Fret {pos.fret}
										</li>
									))}
								</ul>
							)}
						</div>
					</>
				)}
			</div>

			<div className="mt-4 flex justify-end">
				<button
					type="button"
					onClick={onContinue}
					className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
				>
					{isCorrect ? "Continue" : "Try Next Question"}
				</button>
			</div>
		</div>
	);
}

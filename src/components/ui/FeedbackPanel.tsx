import { Button } from "./Button";

interface FeedbackPanelProps {
	isCorrect: boolean;
	message: string;
	onNext?: () => void;
	nextLabel?: string;
	onReplay?: () => void;
	replayLabel?: string;
	className?: string;
}

export function FeedbackPanel({
	isCorrect,
	message,
	onNext,
	nextLabel = "Next",
	onReplay,
	replayLabel = "Replay",
	className = "",
}: FeedbackPanelProps) {
	return (
		<div
			className={`space-y-4 rounded-[18px] p-5 transition-all duration-300 ease-out animate-gb-slide-up ${className}`}
			style={{
				background: isCorrect
					? "color-mix(in srgb, #16a34a 12%, var(--gb-bg-elev))"
					: "color-mix(in srgb, #dc2626 8%, var(--gb-bg-elev))",
				border: `1px solid ${
					isCorrect
						? "color-mix(in srgb, #16a34a 30%, var(--gb-border))"
						: "color-mix(in srgb, #dc2626 24%, var(--gb-border))"
				}`,
			}}
		>
			<p className="text-lg font-semibold" style={{ color: isCorrect ? "#166534" : "#991b1b" }}>
				{message}
			</p>
			{onNext || onReplay ? (
				<div className="flex flex-wrap gap-3">
					{onNext ? (
						<Button
							onClick={onNext}
							className="border-b-4 border-b-[var(--gb-accent-strong)] bg-[var(--gb-accent)] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 active:translate-y-0.5 active:border-b-2"
						>
							{nextLabel}
						</Button>
					) : null}
					{onReplay ? (
						<Button
							variant="secondary"
							onClick={onReplay}
							className="border-b-4 border-b-gray-400 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-50 active:translate-y-0.5 active:border-b-2 dark:border-b-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
						>
							{replayLabel}
						</Button>
					) : null}
				</div>
			) : null}
		</div>
	);
}

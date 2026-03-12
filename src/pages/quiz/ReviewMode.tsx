import { useState } from "react";
import { Button } from "@/components/ui";
import { sm2Update } from "@/lib/srs";
import type { SRSCard } from "@/types";

const RATING_CONFIG = [
	{
		value: 0,
		label: "No idea",
		description: "Completely blanked — reset and revisit soon",
		color: "#dc2626", // red-600
		bgColor: "#fef2f2", // red-50
		borderColor: "#fca5a5", // red-300
	},
	{
		value: 1,
		label: "Got it wrong, but I see it now",
		description: "The answer makes sense in hindsight",
		color: "#ea580c", // orange-600
		bgColor: "#fff7ed", // orange-50
		borderColor: "#fdba74", // orange-300
	},
	{
		value: 2,
		label: "Got it right, had to think",
		description: "Correct but it took effort to recall",
		color: "#ca8a04", // yellow-600
		bgColor: "#fefce8", // yellow-50
		borderColor: "#fde047", // yellow-300
	},
	{
		value: 3,
		label: "Knew it instantly",
		description: "No hesitation — this one is solid",
		color: "#16a34a", // green-600
		bgColor: "#f0fdf4", // green-50
		borderColor: "#86efac", // green-300
	},
] as const;

interface ReviewResult {
	cardId: string;
	rating: number;
	correct: boolean;
	updatedCard: SRSCard;
}

interface ReviewModeProps {
	cards: SRSCard[];
	onComplete: (results: ReviewResult[]) => void;
	onCancel: () => void;
}

export function ReviewMode({ cards, onComplete, onCancel }: ReviewModeProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [results, setResults] = useState<ReviewResult[]>([]);
	const [rating, setRating] = useState<number | null>(null);

	const currentCard = cards[currentIndex];
	const isLast = currentIndex === cards.length - 1;

	const handleRatingSelect = (selectedRating: number) => {
		setRating(selectedRating);
	};

	const handleNext = () => {
		if (rating === null || !currentCard) return;

		const updatedCard = sm2Update(currentCard, rating as 0 | 1 | 2 | 3);
		const isCorrect = rating >= 2;

		const newResult: ReviewResult = {
			cardId: currentCard.id,
			rating,
			correct: isCorrect,
			updatedCard,
		};

		const allResults = [...results, newResult];

		if (isLast) {
			onComplete(allResults);
		} else {
			setResults(allResults);
			setCurrentIndex((prev) => prev + 1);
			setRating(null);
		}
	};

	if (!currentCard) {
		return (
			<div className="max-w-2xl mx-auto p-6">
				<div
					className="rounded-2xl p-8 text-center text-sm"
					style={{
						background: "var(--gb-bg-elev)",
						border: "1px solid var(--gb-border)",
						color: "var(--gb-text-muted)",
					}}
				>
					No cards to review.
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-5">
			{/* Header */}
			<div className="space-y-3">
				<div className="flex justify-between items-start">
					<div>
						<p className="gb-page-kicker mb-0.5">Spaced Repetition</p>
						<h2 className="gb-page-title">Review Due Cards</h2>
					</div>
					<button
						type="button"
						onClick={onCancel}
						className="text-sm font-medium transition-colors hover:opacity-70 focus-visible:outline-none"
						style={{ color: "var(--gb-text-muted)" }}
					>
						Cancel
					</button>
				</div>

				{/* Progress bar */}
				<div className="flex items-center gap-3">
					<div
						className="flex-1 h-2 rounded-full overflow-hidden"
						style={{ background: "var(--gb-bg-panel)" }}
					>
						<div
							className="h-full rounded-full transition-all"
							style={{
								width: `${((currentIndex + 1) / cards.length) * 100}%`,
								background: "var(--gb-accent)",
							}}
						/>
					</div>
					<span
						className="text-xs tabular-nums font-medium"
						style={{ color: "var(--gb-text-muted)" }}
					>
						{currentIndex + 1} / {cards.length}
					</span>
				</div>
			</div>

			{/* Card */}
			<div
				className="rounded-2xl p-6 space-y-5"
				style={{
					background: "var(--gb-bg-elev)",
					border: "1px solid var(--gb-border)",
					boxShadow: "var(--gb-shadow-soft)",
				}}
			>
				<div>
					<h3 className="font-semibold text-base" style={{ color: "var(--gb-text)" }}>
						{currentCard.subCategory}
					</h3>
					<p className="text-xs mt-0.5" style={{ color: "var(--gb-text-muted)" }}>
						Category: {currentCard.category}
					</p>
				</div>

				<div
					className="rounded-xl p-4 space-y-2 text-sm"
					style={{ background: "var(--gb-bg-panel)", border: "1px solid var(--gb-border)" }}
				>
					<p className="font-medium" style={{ color: "var(--gb-text)" }}>
						How did it go?
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					{RATING_CONFIG.map((config) => {
						const isSelected = rating === config.value;
						return (
							<button
								key={config.value}
								type="button"
								onClick={() => handleRatingSelect(config.value)}
								style={
									isSelected
										? {
												background: config.color,
												color: "#fff",
												borderColor: config.color,
											}
										: {
												background: "var(--gb-bg-panel)",
												color: "var(--gb-text)",
												borderColor: "var(--gb-border)",
											}
								}
								className="rounded-xl border-2 p-3 text-left transition-all hover:shadow-sm focus-visible:outline-none"
							>
								<div className="text-sm font-semibold">{config.label}</div>
								<div
									className="mt-0.5 text-xs"
									style={{
										color: isSelected ? "rgba(255,255,255,0.8)" : "var(--gb-text-muted)",
									}}
								>
									{config.description}
								</div>
							</button>
						);
					})}
				</div>

				<div className="flex justify-end gap-2">
					<Button variant="secondary" onClick={onCancel}>
						Cancel Review
					</Button>
					<Button onClick={handleNext} disabled={rating === null}>
						{isLast ? "Complete Review" : "Next Card"}
					</Button>
				</div>
			</div>
		</div>
	);
}

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sm2Update } from "@/lib/srs";
import type { SRSCard } from "@/types";

const RATING_CONFIG = [
	{
		value: 0,
		label: "No idea",
		description: "Completely blanked — reset and revisit soon",
		color: "#dc2626", // red-600
	},
	{
		value: 1,
		label: "Got it wrong, but I see it now",
		description: "The answer makes sense in hindsight",
		color: "#ea580c", // orange-600
	},
	{
		value: 2,
		label: "Got it right, had to think",
		description: "Correct but it took effort to recall",
		color: "#ca8a04", // yellow-600
	},
	{
		value: 3,
		label: "Knew it instantly",
		description: "No hesitation — this one is solid",
		color: "#16a34a", // green-600
	},
] as const;

interface ReviewSegmentViewProps {
	cards: SRSCard[];
	updateCard: (card: SRSCard) => void;
	onComplete: (correct: number, total: number) => void;
}

export function ReviewSegmentView({ cards, updateCard, onComplete }: ReviewSegmentViewProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [correctCount, setCorrectCount] = useState(0);
	const [selectedRating, setSelectedRating] = useState<number | null>(null);

	const currentCard = cards[currentIndex];

	const handleRatingSelect = (rating: number) => {
		setSelectedRating(rating);
	};

	const handleNext = () => {
		if (selectedRating === null || !currentCard) return;

		const updatedCard = sm2Update(currentCard, selectedRating as 0 | 1 | 2 | 3);
		updateCard(updatedCard);

		const isCorrect = selectedRating >= 2;
		if (isCorrect) setCorrectCount((prev) => prev + 1);

		if (currentIndex === cards.length - 1) {
			onComplete(correctCount + (isCorrect ? 1 : 0), cards.length);
		} else {
			setCurrentIndex((prev) => prev + 1);
			setSelectedRating(null);
		}
	};

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-accent)]">
						Step 1: SRS Review
					</h3>
					<span className="text-xs font-medium text-[var(--gb-text-muted)]">
						{currentIndex + 1} of {cards.length} cards
					</span>
				</div>

				<div className="gb-panel p-6 shadow-[var(--gb-shadow-soft)]">
					<p className="text-xs font-medium text-[var(--gb-text-muted)]">
						Category: {currentCard.category}
					</p>
					<h4 className="mt-1 text-2xl font-bold text-[var(--gb-text)]">
						{currentCard.subCategory}
					</h4>

					<div className="mt-8 space-y-4">
						<p className="text-sm font-semibold">How did it go?</p>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{RATING_CONFIG.map((config) => (
								<button
									key={config.value}
									type="button"
									onClick={() => handleRatingSelect(config.value)}
									className={`rounded-xl border-2 p-3 text-left transition-all ${
										selectedRating === config.value
											? "border-transparent text-white"
											: "border-[var(--gb-border)] bg-[var(--gb-bg-panel)] text-[var(--gb-text)] hover:shadow-sm"
									}`}
									style={{
										backgroundColor: selectedRating === config.value ? config.color : undefined,
									}}
								>
									<div className="text-sm font-bold">{config.label}</div>
									<div
										className="mt-0.5 text-xs opacity-80"
										style={{
											color: selectedRating === config.value ? "white" : "var(--gb-text-muted)",
										}}
									>
										{config.description}
									</div>
								</button>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="flex justify-end">
				<Button onClick={handleNext} disabled={selectedRating === null}>
					{currentIndex === cards.length - 1 ? "Finish Review" : "Next Card"}
				</Button>
			</div>
		</div>
	);
}

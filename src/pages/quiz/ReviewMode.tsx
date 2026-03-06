import { useState } from "react";
import { Button } from "@/components/ui";
import { sm2Update } from "@/lib/srs";
import type { SRSCard } from "@/types";

interface ReviewResult {
	cardId: string;
	rating: number;
	correct: boolean;
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

		sm2Update(currentCard, rating as 0 | 1 | 2 | 3);
		const isCorrect = rating >= 2;

		const newResult: ReviewResult = { cardId: currentCard.id, rating, correct: isCorrect };
		setResults((prev) => [...prev, newResult]);

		if (isLast) {
			onComplete([...results, newResult]);
		} else {
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
						How well did you remember this?
					</p>
					<ul className="space-y-0.5 text-xs" style={{ color: "var(--gb-text-muted)" }}>
						<li>0 — Wrong (reset card)</li>
						<li>1 — Hard (more practice needed)</li>
						<li>2 — Good (remembered)</li>
						<li>3 — Easy (well known)</li>
					</ul>
				</div>

				<div className="flex gap-2 flex-wrap">
					{[0, 1, 2, 3].map((r) => (
						<button
							key={r}
							type="button"
							onClick={() => handleRatingSelect(r)}
							style={
								rating === r
									? {
											background: "var(--gb-accent)",
											color: "#fff8ee",
											borderColor: "var(--gb-accent)",
										}
									: {
											background: "var(--gb-bg-panel)",
											color: "var(--gb-text)",
											borderColor: "var(--gb-border)",
										}
							}
							className="px-4 py-2 rounded-full border font-medium text-sm transition-all hover:opacity-90 focus-visible:outline-none"
						>
							{r} — {["Wrong", "Hard", "Good", "Easy"][r]}
						</button>
					))}
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

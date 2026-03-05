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

		const newResult: ReviewResult = {
			cardId: currentCard.id,
			rating,
			correct: isCorrect,
		};

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
			<div className="p-6">
				<p className="text-gray-500">No cards to review.</p>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="mb-6">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-2xl font-bold text-gray-900">Review Due Cards</h2>
					<button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
						Cancel
					</button>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex-1 bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-500 h-2 rounded-full transition-all"
							style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
						/>
					</div>
					<span className="text-sm text-gray-600">
						{currentIndex + 1} / {cards.length}
					</span>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="mb-4">
					<h2 className="text-lg font-medium text-gray-900">Card: {currentCard.subCategory}</h2>
					<p className="text-sm text-gray-500">Category: {currentCard.category}</p>
				</div>

				<div className="mb-4">
					<p className="text-base font-medium text-gray-700 mb-2">
						How well did you remember this?
					</p>
					<p className="text-sm text-gray-600">
						0 = Wrong (reset card)
						<br />1 = Hard (more practice needed)
						<br />2 = Good (remembered)
						<br />3 = Easy (well known)
					</p>
				</div>

				<div className="flex gap-2">
					<Button variant="secondary" onClick={() => handleRatingSelect(0)}>
						0 - Wrong
					</Button>
					<Button variant="secondary" onClick={() => handleRatingSelect(1)}>
						1 - Hard
					</Button>
					<Button
						variant={rating === 2 ? "primary" : "secondary"}
						onClick={() => handleRatingSelect(2)}
					>
						2 - Good
					</Button>
					<Button variant="secondary" onClick={() => handleRatingSelect(3)}>
						3 - Easy
					</Button>
				</div>

				<div className="flex justify-end gap-2 mt-4">
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

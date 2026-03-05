import type { SRSCard } from "@/types";
import { addDays, getToday } from "./date";

/**
 * Update an SRS card based on user performance rating using SM-2 algorithm
 */
export function sm2Update(card: SRSCard, rating: 0 | 1 | 2 | 3): SRSCard {
	const today = getToday();

	if (rating === 0) {
		return {
			...card,
			repetitions: 0,
			intervalDays: 1,
			easeFactor: Math.max(1.3, card.easeFactor - 0.2),
			nextReviewAt: addDays(today, 1),
			lastAccuracy: 0,
		};
	}

	if (rating === 1) {
		const newInterval = Math.max(1, Math.round(card.intervalDays * 1.2));
		return {
			...card,
			repetitions: 0,
			intervalDays: newInterval,
			easeFactor: Math.max(1.3, card.easeFactor - 0.14),
			nextReviewAt: addDays(today, newInterval),
			lastAccuracy: 0.5,
		};
	}

	if (rating === 2) {
		let newInterval: number;
		if (card.repetitions === 0) {
			newInterval = 1;
		} else if (card.repetitions === 1) {
			newInterval = 6;
		} else {
			newInterval = Math.round(card.intervalDays * card.easeFactor);
		}

		return {
			...card,
			repetitions: card.repetitions + 1,
			intervalDays: newInterval,
			easeFactor: card.easeFactor,
			nextReviewAt: addDays(today, newInterval),
			lastAccuracy: 0.8,
		};
	}

	const newInterval = Math.max(
		Math.round(card.intervalDays * card.easeFactor * 1.3),
		card.intervalDays + 1,
	);

	return {
		...card,
		repetitions: card.repetitions + 1,
		intervalDays: newInterval,
		easeFactor: Math.min(3.0, card.easeFactor + 0.1),
		nextReviewAt: addDays(today, newInterval),
		lastAccuracy: 1.0,
	};
}

/**
 * Get all SRS cards due for review today or earlier
 */
export function getDueCards(cards: Record<string, SRSCard>): SRSCard[] {
	const today = getToday();
	return Object.values(cards)
		.filter((card) => card.nextReviewAt <= today)
		.sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt));
}

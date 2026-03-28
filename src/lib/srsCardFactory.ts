import type { Question } from "@/pages/quiz/questions";
import type { SRSCard } from "@/types";
import { getToday } from "./date";
import { sm2Update } from "./srs";

const STRING_LABELS = ["E", "A", "D", "G", "B", "e"];

export function deriveCardId(question: Question): string {
	switch (question.type) {
		case "note":
			return `note:${question.targetNote}:string${question.targetString ?? 0}`;
		case "note-guess":
		case "note-guess-sound":
			return `note:${question.targetNote}:string${question.shownPosition.string}`;
		case "interval":
			return `interval:${question.targetInterval}`;
		case "chord":
			return `chord:${question.targetChord}`;
	}
}

function deriveCategory(question: Question): SRSCard["category"] {
	switch (question.type) {
		case "note":
		case "note-guess":
		case "note-guess-sound":
			return "note";
		case "interval":
			return "interval";
		case "chord":
			return "chord";
	}
}

function deriveSubCategory(question: Question): string {
	switch (question.type) {
		case "note":
			return `Note ${question.targetNote} on ${question.targetStringLabel ?? STRING_LABELS[question.targetString ?? 0]} string`;
		case "note-guess":
		case "note-guess-sound":
			return `Note ${question.targetNote} on ${STRING_LABELS[question.shownPosition.string]} string`;
		case "interval":
			return question.targetInterval;
		case "chord":
			return question.targetChord;
	}
}

export function createOrUpdateSRSCard(
	question: Question,
	isCorrect: boolean,
	existingCard: SRSCard | undefined,
): SRSCard {
	const rating: 0 | 2 = isCorrect ? 2 : 0;

	if (existingCard) {
		return sm2Update(existingCard, rating);
	}

	const freshCard: SRSCard = {
		id: deriveCardId(question),
		category: deriveCategory(question),
		subCategory: deriveSubCategory(question),
		easeFactor: 2.5,
		intervalDays: 0,
		repetitions: 0,
		nextReviewAt: getToday(),
		lastAccuracy: null,
	};

	return sm2Update(freshCard, rating);
}

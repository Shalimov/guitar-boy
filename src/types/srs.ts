/** Card categories for spaced repetition */
export type CardCategory = "note" | "interval" | "chord";

/** Spaced repetition card tracking learning progress */
export interface SRSCard {
	/** Unique ID (e.g., "note:C:string2", "interval:M3", "chord:Cmaj") */
	id: string;
	category: CardCategory;
	/** Human-readable topic label */
	subCategory: string;
	/** SM-2 ease factor, starts at 2.5 */
	easeFactor: number;
	/** Days until next review */
	intervalDays: number;
	/** ISO date (no time component) */
	nextReviewAt: string;
	/** Number of successful reviews */
	repetitions: number;
	/** Most recent session accuracy (0-1) or null if no attempts */
	lastAccuracy: number | null;
}

/** Records a single quiz or review session */
export interface SessionRecord {
	/** ISO date */
	date: string;
	mode: AppMode;
	totalQuestions: number;
	correct: number;
	/** Duration in milliseconds */
	durationMs: number;
}

/** Application modes */
export type AppMode =
	| "whiteboard"
	| "learning"
	| "quiz-note"
	| "quiz-interval"
	| "quiz-chord"
	| "review";

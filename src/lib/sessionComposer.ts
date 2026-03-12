import type { Question } from "@/pages/quiz/questions";
import type { SessionRecord, SRSCard } from "@/types";

export type SessionSegmentType = "review" | "quiz" | "ear-training" | "warmup";

export interface WarmUpSegment {
	type: "warmup";
	questions: Question[];
	sourceMode: string;
}

export interface ReviewSegment {
	type: "review";
	cards: SRSCard[];
}

export interface QuizSegment {
	type: "quiz";
	/** Which quiz type to use based on weakest area */
	quizType: "note" | "note-guess" | "interval";
	questionCount: number;
	difficulty: "beginner" | "intermediate" | "advanced";
}

export interface EarTrainingSegment {
	type: "ear-training";
	/** Number of ear training rounds */
	rounds: number;
}

export type SessionSegment = WarmUpSegment | ReviewSegment | QuizSegment | EarTrainingSegment;

export interface SessionPlan {
	segments: SessionSegment[];
	totalSteps: number;
}

/**
 * Compose an optimal daily practice session based on current state.
 *
 * Rules:
 * 1. If there are due SRS cards, start with review (max 10 cards)
 * 2. Always include a quiz segment (5 questions from weakest category)
 * 3. Always include 1 ear training segment (fixed rounds)
 * 4. Determine weakest category from session history accuracy
 */
export function composeSession(dueCards: SRSCard[], sessionHistory: SessionRecord[]): SessionPlan {
	const segments: SessionSegment[] = [];
	let totalSteps = 0;

	// Segment 1: Review due cards (max 10)
	if (dueCards.length > 0) {
		const reviewCards = dueCards.slice(0, 10);
		segments.push({ type: "review", cards: reviewCards });
		totalSteps += reviewCards.length;
	}

	// Segment 2: Targeted quiz
	const weakest = findWeakestCategory(sessionHistory);
	const quizCount = 5;
	segments.push({
		type: "quiz",
		quizType: weakest,
		questionCount: quizCount,
		difficulty: "beginner",
	});
	totalSteps += quizCount;

	// Segment 3: Ear training
	const earRounds = 3;
	segments.push({ type: "ear-training", rounds: earRounds });
	totalSteps += earRounds;

	return { segments, totalSteps };
}

/**
 * Find the quiz category with the lowest accuracy
 * from recent session history. Defaults to "note" if no data.
 */
export function findWeakestCategory(
	sessionHistory: SessionRecord[],
): "note" | "note-guess" | "interval" {
	const modes = ["quiz-note", "quiz-interval"] as const;
	const stats = modes.map((mode) => {
		const modeSessions = sessionHistory.filter((s) => s.mode === mode);
		if (modeSessions.length === 0) return { mode, accuracy: -1 }; // -1 means no data

		const totalCorrect = modeSessions.reduce((sum, s) => sum + s.correct, 0);
		const totalQuestions = modeSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
		const accuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

		return { mode, accuracy };
	});

	// Prioritize modes with no data first (accuracy -1)
	const noData = stats.find((s) => s.accuracy === -1);
	if (noData) {
		return noData.mode === "quiz-note" ? "note" : "interval";
	}

	// Then pick the one with lowest accuracy
	const weakest = stats.sort((a, b) => a.accuracy - b.accuracy)[0];

	if (weakest.mode === "quiz-note") return "note";
	if (weakest.mode === "quiz-interval") return "interval";

	return "note";
}

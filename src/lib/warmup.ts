import { generateQuestions, type Question } from "@/pages/quiz/questions";
import type { SessionRecord } from "@/types";

/**
 * Generate 3 warm-up questions based on the most recent session.
 */
export function generateWarmUp(
	sessionHistory: SessionRecord[],
): { questions: Question[]; sourceMode: string } | null {
	if (sessionHistory.length === 0) return null;

	// 1. Find most recent quiz session (mode starts with "quiz-")
	const lastQuiz = sessionHistory.find((s) => s.mode.startsWith("quiz-"));
	if (!lastQuiz) return null;

	// 2. Map mode to quiz type
	const modeToType: Record<string, string> = {
		"quiz-note": "note",
		"quiz-interval": "interval",
		"quiz-chord": "chord",
	};
	const type = modeToType[lastQuiz.mode] || "note";

	// 3. Generate 3 questions at "beginner" difficulty (or same as last session if we tracked it)
	// For now, use "beginner" as a safe warm-up level
	const questions = generateQuestions(type as any, "beginner", 3);

	return {
		questions,
		sourceMode: type === "note" ? "Notes" : type === "interval" ? "Intervals" : "Chords",
	};
}

/**
 * Generate a cool-down preview message about what's coming next.
 *
 * Returns a text description of what the next session might focus on.
 */
export function generateCoolDownPreview(
	sessionHistory: SessionRecord[],
	dueCardCount: number,
): string {
	if (dueCardCount > 0) {
		return `Tomorrow: ${dueCardCount} review cards waiting — keep that retention high.`;
	}

	// Identify weakest area from recent history
	const modes = ["quiz-note", "quiz-interval", "quiz-chord"] as const;
	const stats = modes.map((m) => {
		const sessions = sessionHistory.filter((s) => s.mode === m);
		if (sessions.length === 0) return { mode: m, accuracy: 1 }; // assume 100% if untried for this check
		const correct = sessions.reduce((a, b) => a + b.correct, 0);
		const total = sessions.reduce((a, b) => a + b.totalQuestions, 0);
		return { mode: m, accuracy: total > 0 ? correct / total : 1 };
	});

	const weakest = stats.sort((a, b) => a.accuracy - b.accuracy)[0];
	if (weakest && weakest.accuracy < 0.8) {
		const label =
			weakest.mode === "quiz-note"
				? "Notes"
				: weakest.mode === "quiz-interval"
					? "Intervals"
					: "Chords";
		return `Next focus: ${label} — we'll spend more time here until it feels intuitive.`;
	}

	return "Great work! Come back tomorrow to keep the streak alive.";
}

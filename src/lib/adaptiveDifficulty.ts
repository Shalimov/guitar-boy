import type { AppMode, SessionRecord } from "@/types";

export interface AdaptiveConfig {
	/** Max fret number the user should practice up to */
	effectiveFretMax: number;
	/** Suggested difficulty label for UI */
	suggestedDifficulty: "beginner" | "intermediate" | "advanced";
	/** Rolling accuracy (0–1) over recent sessions */
	rollingAccuracy: number;
}

/** Number of recent sessions to consider */
const WINDOW_SIZE = 10;

/** Accuracy thresholds for expanding fret range */
const EXPAND_THRESHOLD = 0.85; // 85%+ accuracy → expand
const CONTRACT_THRESHOLD = 0.5; // Below 50% → contract

/** Fret range steps */
const FRET_STEPS = [5, 7, 9, 12, 15, 19, 24];

/**
 * Compute the adaptive config for a given quiz category.
 *
 * @param sessions - Full session history (will be filtered by mode)
 * @param mode - The quiz mode to analyze (e.g., "quiz-note", "quiz-interval")
 * @param currentFretMax - The user's current effective fret max (default: 5)
 */
export function computeAdaptiveConfig(
	sessions: SessionRecord[],
	mode: AppMode,
	currentFretMax = 5,
): AdaptiveConfig {
	// 1. Filter sessions by mode
	const modeSessions = sessions.filter((s) => s.mode === mode).slice(0, WINDOW_SIZE);

	// 2. Compute rolling accuracy
	const rollingAccuracy = calculateAccuracy(modeSessions);

	// 3. Determine new fretMax
	let effectiveFretMax = currentFretMax;

	if (modeSessions.length >= 3) {
		// Only adjust if we have some data
		if (rollingAccuracy >= EXPAND_THRESHOLD) {
			const currentIndex = FRET_STEPS.indexOf(snapToFretStep(currentFretMax));
			if (currentIndex < FRET_STEPS.length - 1) {
				effectiveFretMax = FRET_STEPS[currentIndex + 1];
			}
		} else if (rollingAccuracy <= CONTRACT_THRESHOLD) {
			const currentIndex = FRET_STEPS.indexOf(snapToFretStep(currentFretMax));
			if (currentIndex > 0) {
				effectiveFretMax = FRET_STEPS[currentIndex - 1];
			}
		}
	}

	// 4. Map fretMax to a difficulty label
	let suggestedDifficulty: "beginner" | "intermediate" | "advanced" = "beginner";
	if (effectiveFretMax > 12) {
		suggestedDifficulty = "advanced";
	} else if (effectiveFretMax > 5) {
		suggestedDifficulty = "intermediate";
	}

	return {
		effectiveFretMax,
		suggestedDifficulty,
		rollingAccuracy,
	};
}

/**
 * Map a fret max value to the nearest step in FRET_STEPS.
 */
export function snapToFretStep(fretMax: number): number {
	return FRET_STEPS.reduce((prev, curr) => {
		return Math.abs(curr - fretMax) < Math.abs(prev - fretMax) ? curr : prev;
	});
}

/**
 * Calculate accuracy from a list of sessions.
 */
export function calculateAccuracy(sessions: SessionRecord[]): number {
	if (sessions.length === 0) return 0;
	const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);
	const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
	return totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
}

import { addDays, getToday } from "./date";

/**
 * Given a sorted-desc array of ISO date strings (from sessionHistory),
 * compute the current streak and longest streak.
 *
 * A "streak" is consecutive calendar days that have at least one session.
 * Today counts as part of the streak. If the user hasn't practiced today
 * but practiced yesterday, the streak is still alive (they have until
 * end of today to extend it).
 */
export function computeStreak(sessionDates: string[]): {
	currentStreak: number;
	longestStreak: number;
	activeDays: string[];
} {
	if (sessionDates.length === 0) {
		return { currentStreak: 0, longestStreak: 0, activeDays: [] };
	}

	// 1. Deduplicate to unique dates (YYYY-MM-DD) and sort ascending
	const uniqueDates = Array.from(new Set(sessionDates.map((d) => d.split("T")[0]))).sort();

	if (uniqueDates.length === 0) {
		return { currentStreak: 0, longestStreak: 0, activeDays: [] };
	}

	const today = getToday();
	const yesterday = addDays(today, -1);

	// 2. Compute current streak by walking backwards from today/yesterday
	let currentStreak = 0;
	let lastCheckDate = today;

	// If the most recent practice was before yesterday, the current streak is 0
	const mostRecentPractice = uniqueDates[uniqueDates.length - 1];
	if (mostRecentPractice < yesterday) {
		currentStreak = 0;
	} else {
		// Start from the most recent practice date that is either today or yesterday
		lastCheckDate = mostRecentPractice;
		currentStreak = 1;

		for (let i = uniqueDates.length - 2; i >= 0; i--) {
			const date = uniqueDates[i];
			const expectedDate = addDays(lastCheckDate, -1);

			if (date === expectedDate) {
				currentStreak++;
				lastCheckDate = date;
			} else {
				break;
			}
		}
	}

	// 3. Compute longest streak by scanning all consecutive runs
	let longestStreak = 0;
	let currentRun = 0;
	let lastInRun: string | null = null;

	for (const date of uniqueDates) {
		if (lastInRun === null) {
			currentRun = 1;
		} else {
			const expectedDate = addDays(lastInRun, 1);
			if (date === expectedDate) {
				currentRun++;
			} else {
				longestStreak = Math.max(longestStreak, currentRun);
				currentRun = 1;
			}
		}
		lastInRun = date;
	}
	longestStreak = Math.max(longestStreak, currentRun);

	// 4. Return unique dates (sorted ascending) as activeDays
	// TASK-01 says: activeDays should be the last 90 days of unique practice dates
	const activeDays = uniqueDates.slice(-90);

	return {
		currentStreak,
		longestStreak,
		activeDays,
	};
}

/**
 * Get unique calendar days from session records.
 * Returns deduplicated YYYY-MM-DD strings, sorted ascending.
 */
export function getActiveDays(sessions: { date: string }[]): string[] {
	const uniqueDates = Array.from(new Set(sessions.map((s) => s.date.split("T")[0]))).sort();
	return uniqueDates;
}

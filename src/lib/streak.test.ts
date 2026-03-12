import { addDays, getToday } from "./date";
import { computeStreak, getActiveDays } from "./streak";

describe("streak utility", () => {
	const today = getToday();
	const yesterday = addDays(today, -1);
	const dayBefore = addDays(today, -2);
	const _longAgo = addDays(today, -10);

	describe("computeStreak", () => {
		it("returns 0 for empty sessions", () => {
			const result = computeStreak([]);
			expect(result.currentStreak).toBe(0);
			expect(result.longestStreak).toBe(0);
			expect(result.activeDays).toEqual([]);
		});

		it("returns 1 for a single session today", () => {
			const result = computeStreak([today]);
			expect(result.currentStreak).toBe(1);
			expect(result.longestStreak).toBe(1);
			expect(result.activeDays).toEqual([today]);
		});

		it("returns 2 for sessions today and yesterday", () => {
			const result = computeStreak([yesterday, today]);
			expect(result.currentStreak).toBe(2);
			expect(result.longestStreak).toBe(2);
			expect(result.activeDays).toEqual([yesterday, today]);
		});

		it("returns 1 for session yesterday but not today", () => {
			const result = computeStreak([yesterday]);
			expect(result.currentStreak).toBe(1);
			expect(result.longestStreak).toBe(1);
		});

		it("returns 0 for session more than 1 day ago", () => {
			const result = computeStreak([dayBefore]);
			expect(result.currentStreak).toBe(0);
			expect(result.longestStreak).toBe(1);
		});

		it("handles multiple sessions on the same day", () => {
			const result = computeStreak([today, today, yesterday]);
			expect(result.currentStreak).toBe(2);
			expect(result.longestStreak).toBe(2);
		});

		it("computes independent longest streak with gaps", () => {
			// Streak of 3 from ago, then gap, then streak of 1 today
			const d3 = addDays(today, -3);
			const d4 = addDays(today, -4);
			const d5 = addDays(today, -5);
			const result = computeStreak([d5, d4, d3, today]);
			expect(result.currentStreak).toBe(1);
			expect(result.longestStreak).toBe(3);
		});

		it("computes current streak as longest if it is the longest", () => {
			const result = computeStreak([dayBefore, yesterday, today]);
			expect(result.currentStreak).toBe(3);
			expect(result.longestStreak).toBe(3);
		});

		it("handles unsorted inputs", () => {
			const result = computeStreak([today, dayBefore, yesterday]);
			expect(result.currentStreak).toBe(3);
			expect(result.longestStreak).toBe(3);
		});
	});

	describe("getActiveDays", () => {
		it("deduplicates and sorts session dates", () => {
			const sessions = [
				{ date: `${today}T10:00:00Z` },
				{ date: `${yesterday}T08:00:00Z` },
				{ date: `${today}T12:00:00Z` },
			];
			const result = getActiveDays(sessions);
			expect(result).toEqual([yesterday, today]);
		});
	});
});

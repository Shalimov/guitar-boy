import { act, renderHook } from "@testing-library/react";
import type { SessionRecord, SRSCard } from "@/types";
import { useProgressStore } from "./useProgressStore";

describe("useProgressStore", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns initial store", () => {
		const { result } = renderHook(() => useProgressStore());
		expect(result.current.store.version).toBe(1);
		expect(result.current.store.cards).toEqual({});
		expect(result.current.store.settings.accidentalPreference).toBe("sharp");
	});

	it("updates a card", () => {
		const { result } = renderHook(() => useProgressStore());
		const card: SRSCard = {
			id: "note:C:string0",
			category: "note",
			subCategory: "C on low E",
			easeFactor: 2.5,
			intervalDays: 1,
			nextReviewAt: "2026-03-05",
			repetitions: 1,
			lastAccuracy: 0.8,
		};

		act(() => {
			result.current.updateCard(card);
		});

		expect(result.current.store.cards["note:C:string0"]).toEqual(card);
	});

	it("adds a session", () => {
		const { result } = renderHook(() => useProgressStore());
		const session: SessionRecord = {
			date: "2026-03-04",
			mode: "quiz-note",
			totalQuestions: 10,
			correct: 8,
			durationMs: 60000,
		};

		act(() => {
			result.current.addSession(session);
		});

		expect(result.current.store.sessionHistory).toHaveLength(1);
		expect(result.current.store.sessionHistory[0]).toEqual(session);
	});

	it("updates settings", () => {
		const { result } = renderHook(() => useProgressStore());

		act(() => {
			result.current.updateSettings({ accidentalPreference: "flat" });
		});

		expect(result.current.store.settings.accidentalPreference).toBe("flat");
		expect(result.current.store.settings.fretRange).toEqual({ min: 0, max: 12 });
	});

	it("gets a card by ID", () => {
		const { result } = renderHook(() => useProgressStore());
		const card: SRSCard = {
			id: "note:C:string0",
			category: "note",
			subCategory: "C on low E",
			easeFactor: 2.5,
			intervalDays: 1,
			nextReviewAt: "2026-03-05",
			repetitions: 1,
			lastAccuracy: 0.8,
		};

		act(() => {
			result.current.updateCard(card);
		});

		expect(result.current.getCard("note:C:string0")).toEqual(card);
		expect(result.current.getCard("nonexistent")).toBeUndefined();
	});

	it("limits session history to 100 items", () => {
		const { result } = renderHook(() => useProgressStore());

		for (let i = 0; i < 150; i++) {
			act(() => {
				result.current.addSession({
					date: `2026-03-${String((i % 30) + 1).padStart(2, "0")}`,
					mode: "quiz-note",
					totalQuestions: 10,
					correct: 8,
					durationMs: 60000,
				});
			});
		}

		expect(result.current.store.sessionHistory.length).toBe(100);
	});
});

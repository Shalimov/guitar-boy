import type { SRSCard } from "@/types";
import { getDueCards, sm2Update } from "./srs";

describe("sm2Update", () => {
	const newCard: SRSCard = {
		id: "note:C:string0",
		category: "note",
		subCategory: "Note C on low E string",
		easeFactor: 2.5,
		intervalDays: 0,
		nextReviewAt: "2026-03-04",
		repetitions: 0,
		lastAccuracy: null,
	};

	describe("rating 0 (Wrong)", () => {
		it("resets repetitions and interval", () => {
			const result = sm2Update(newCard, 0);
			expect(result.repetitions).toBe(0);
			expect(result.intervalDays).toBe(1);
			expect(result.easeFactor).toBe(2.3);
			expect(result.lastAccuracy).toBe(0);
		});

		it("decreases easeFactor with minimum 1.3", () => {
			const card = { ...newCard, easeFactor: 1.4 };
			const result = sm2Update(card, 0);
			expect(result.easeFactor).toBe(1.3);
		});
	});

	describe("rating 1 (Hard)", () => {
		it("increases interval by 20%", () => {
			const card = { ...newCard, intervalDays: 10 };
			const result = sm2Update(card, 1);
			expect(result.intervalDays).toBe(12);
			expect(result.repetitions).toBe(0);
			expect(result.easeFactor).toBe(2.36);
			expect(result.lastAccuracy).toBe(0.5);
		});
	});

	describe("rating 2 (Good)", () => {
		it("sets interval to 1 on first repetition", () => {
			const result = sm2Update(newCard, 2);
			expect(result.repetitions).toBe(1);
			expect(result.intervalDays).toBe(1);
			expect(result.easeFactor).toBe(2.5);
			expect(result.lastAccuracy).toBe(0.8);
		});

		it("sets interval to 6 on second repetition", () => {
			const card = { ...newCard, repetitions: 1 };
			const result = sm2Update(card, 2);
			expect(result.repetitions).toBe(2);
			expect(result.intervalDays).toBe(6);
		});

		it("multiplies interval by easeFactor after second repetition", () => {
			const card = { ...newCard, repetitions: 2, intervalDays: 6, easeFactor: 2.5 };
			const result = sm2Update(card, 2);
			expect(result.intervalDays).toBe(15);
		});
	});

	describe("rating 3 (Easy)", () => {
		it("increases interval and easeFactor", () => {
			const result = sm2Update(newCard, 3);
			expect(result.repetitions).toBe(1);
			expect(result.intervalDays).toBeGreaterThanOrEqual(1);
			expect(result.easeFactor).toBe(2.6);
			expect(result.lastAccuracy).toBe(1.0);
		});

		it("caps easeFactor at 3.0", () => {
			const card = { ...newCard, easeFactor: 2.95 };
			const result = sm2Update(card, 3);
			expect(result.easeFactor).toBe(3.0);
		});
	});
});

describe("getDueCards", () => {
	const createCard = (id: string, nextReviewAt: string): SRSCard => ({
		id,
		category: "note",
		subCategory: "Test card",
		easeFactor: 2.5,
		intervalDays: 1,
		nextReviewAt,
		repetitions: 0,
		lastAccuracy: null,
	});

	it("returns cards due today or earlier", () => {
		const today = new Date().toISOString().split("T")[0];
		const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
		const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

		const cards = {
			past: createCard("past", yesterday),
			today: createCard("today", today),
			future: createCard("future", tomorrow),
		};

		const due = getDueCards(cards);
		expect(due).toHaveLength(2);
		expect(due.map((c) => c.id)).toContain("past");
		expect(due.map((c) => c.id)).toContain("today");
		expect(due.map((c) => c.id)).not.toContain("future");
	});

	it("sorts cards by nextReviewAt date", () => {
		const today = new Date().toISOString().split("T")[0];
		const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

		const cards = {
			today: createCard("today", today),
			past: createCard("past", yesterday),
		};

		const due = getDueCards(cards);
		expect(due[0].id).toBe("past");
		expect(due[1].id).toBe("today");
	});

	it("returns empty array when no cards due", () => {
		const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
		const cards = {
			future: createCard("future", tomorrow),
		};

		const due = getDueCards(cards);
		expect(due).toHaveLength(0);
	});
});

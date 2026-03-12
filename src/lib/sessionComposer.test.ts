import type { SessionRecord, SRSCard } from "@/types";
import { composeSession, findWeakestCategory } from "./sessionComposer";

describe("sessionComposer", () => {
	const mockCard: SRSCard = {
		id: "card-1",
		category: "note",
		subCategory: "C natural",
		intervalDays: 1,
		repetitions: 1,
		easeFactor: 2.5,
		nextReviewAt: new Date().toISOString(),
		lastAccuracy: 1,
	};

	const mockSession: SessionRecord = {
		date: new Date().toISOString(),
		mode: "quiz-note",
		totalQuestions: 10,
		correct: 8,
		durationMs: 60000,
	};

	describe("composeSession", () => {
		it("creates 2 segments (quiz + ear) when no due cards exist", () => {
			const plan = composeSession([], []);
			expect(plan.segments.length).toBe(2);
			expect(plan.segments[0].type).toBe("quiz");
			expect(plan.segments[1].type).toBe("ear-training");
			expect(plan.totalSteps).toBe(5 + 3); // 5 quiz q's + 3 ear rounds
		});

		it("creates 3 segments when due cards exist", () => {
			const plan = composeSession([mockCard], []);
			expect(plan.segments.length).toBe(3);
			expect(plan.segments[0].type).toBe("review");
			expect((plan.segments[0] as any).cards.length).toBe(1);
			expect(plan.totalSteps).toBe(1 + 5 + 3);
		});

		it("caps review at 10 cards", () => {
			const manyCards = Array(15).fill(mockCard);
			const plan = composeSession(manyCards, []);
			expect((plan.segments[0] as any).cards.length).toBe(10);
			expect(plan.totalSteps).toBe(10 + 5 + 3);
		});
	});

	describe("findWeakestCategory", () => {
		it("defaults to note if no history", () => {
			const result = findWeakestCategory([]);
			expect(result).toBe("note");
		});

		it("picks the area with lower accuracy", () => {
			const history: SessionRecord[] = [
				{ ...mockSession, mode: "quiz-note", correct: 10 }, // 100%
				{ ...mockSession, mode: "quiz-interval", correct: 5 }, // 50%
			];
			const result = findWeakestCategory(history);
			expect(result).toBe("interval");
		});

		it("picks area with no data over area with good accuracy", () => {
			const history: SessionRecord[] = [{ ...mockSession, mode: "quiz-note", correct: 10 }];
			const result = findWeakestCategory(history);
			expect(result).toBe("interval");
		});
	});
});

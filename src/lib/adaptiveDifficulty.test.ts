import type { SessionRecord } from "@/types";
import { calculateAccuracy, computeAdaptiveConfig, snapToFretStep } from "./adaptiveDifficulty";

describe("adaptiveDifficulty", () => {
	const mockSession: SessionRecord = {
		date: new Date().toISOString(),
		mode: "quiz-note",
		totalQuestions: 10,
		correct: 9,
		durationMs: 30000,
	};

	describe("calculateAccuracy", () => {
		it("returns 0 for empty sessions", () => {
			expect(calculateAccuracy([])).toBe(0);
		});

		it("returns average accuracy", () => {
			const sessions: SessionRecord[] = [
				{ ...mockSession, correct: 10, totalQuestions: 10 },
				{ ...mockSession, correct: 0, totalQuestions: 10 },
			];
			expect(calculateAccuracy(sessions)).toBe(0.5);
		});
	});

	describe("snapToFretStep", () => {
		it("snaps to nearest predefined step", () => {
			expect(snapToFretStep(5)).toBe(5);
			expect(snapToFretStep(6)).toBe(5); // Closer to 5 than 7
			expect(snapToFretStep(8)).toBe(7); // Closer to 7 than 9
			expect(snapToFretStep(24)).toBe(24);
		});
	});

	describe("computeAdaptiveConfig", () => {
		it("returns default config when no sessions exist", () => {
			const config = computeAdaptiveConfig([], "quiz-note", 5);
			expect(config.effectiveFretMax).toBe(5);
			expect(config.suggestedDifficulty).toBe("beginner");
			expect(config.rollingAccuracy).toBe(0);
		});

		it("expands fret range if accuracy is high", () => {
			const sessions = Array(5).fill({ ...mockSession, correct: 9, totalQuestions: 10 }); // 90% accuracy
			const config = computeAdaptiveConfig(sessions, "quiz-note", 5);
			expect(config.effectiveFretMax).toBe(7);
			expect(config.suggestedDifficulty).toBe("intermediate");
		});

		it("contracts fret range if accuracy is low", () => {
			const sessions = Array(5).fill({ ...mockSession, correct: 2, totalQuestions: 10 }); // 20% accuracy
			const config = computeAdaptiveConfig(sessions, "quiz-note", 7);
			expect(config.effectiveFretMax).toBe(5);
			expect(config.suggestedDifficulty).toBe("beginner");
		});

		it("keeps current fret range if accuracy is moderate", () => {
			const sessions = Array(5).fill({ ...mockSession, correct: 7, totalQuestions: 10 }); // 70% accuracy
			const config = computeAdaptiveConfig(sessions, "quiz-note", 7);
			expect(config.effectiveFretMax).toBe(7);
		});

		it("ignores sessions from other modes", () => {
			const sessions: SessionRecord[] = [
				{ ...mockSession, mode: "quiz-interval", correct: 10, totalQuestions: 10 },
				{ ...mockSession, mode: "quiz-interval", correct: 10, totalQuestions: 10 },
				{ ...mockSession, mode: "quiz-interval", correct: 10, totalQuestions: 10 },
			];
			const config = computeAdaptiveConfig(sessions, "quiz-note", 5);
			expect(config.effectiveFretMax).toBe(5); // No "quiz-note" sessions
			expect(config.rollingAccuracy).toBe(0);
		});
	});
});

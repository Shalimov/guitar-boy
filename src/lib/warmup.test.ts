import type { SessionRecord } from "@/types";
import { generateCoolDownPreview, generateWarmUp } from "./warmup";

describe("warmup", () => {
	it("returns null for empty history", () => {
		expect(generateWarmUp([])).toBeNull();
	});

	it("generates questions for recent note session", () => {
		const history: SessionRecord[] = [
			{
				date: new Date().toISOString(),
				mode: "quiz-note",
				correct: 8,
				totalQuestions: 10,
				durationMs: 60000,
			},
		];
		const result = generateWarmUp(history);
		expect(result).not.toBeNull();
		expect(result?.questions.length).toBe(3);
		expect(result?.sourceMode).toBe("Notes");
	});

	it("ignores non-quiz sessions for warmup", () => {
		const history: SessionRecord[] = [
			{
				date: new Date().toISOString(),
				mode: "learning",
				correct: 5,
				totalQuestions: 5,
				durationMs: 120000,
			},
		];
		expect(generateWarmUp(history)).toBeNull();
	});

	describe("generateCoolDownPreview", () => {
		it("mentions due cards", () => {
			const preview = generateCoolDownPreview([], 5);
			expect(preview).toContain("5 review cards");
		});

		it("identifies weakest area", () => {
			const history: SessionRecord[] = [
				{
					date: new Date().toISOString(),
					mode: "quiz-note",
					correct: 2,
					totalQuestions: 10,
					durationMs: 60000,
				},
			];
			const preview = generateCoolDownPreview(history, 0);
			expect(preview).toContain("Notes");
		});

		it("returns generic message if no issues", () => {
			const preview = generateCoolDownPreview([], 0);
			expect(preview).toContain("streak alive");
		});
	});
});

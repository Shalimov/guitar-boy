import {
	checkPatternCompleteAnswer,
	checkPatternNameAnswer,
	generatePatternQuestions,
	type PatternCompleteQuestion,
	type PatternNameQuestion,
} from "./patternQuestions";

describe("patternQuestions", () => {
	describe("generatePatternQuestions", () => {
		it("generates requested number of complete questions", () => {
			const questions = generatePatternQuestions(5, "complete");
			expect(questions.length).toBe(5);
			expect(questions[0].type).toBe("pattern-complete");
			const q = questions[0] as PatternCompleteQuestion;
			expect(q.shownPositions.length).toBeGreaterThan(0);
			expect(q.targetPositions.length).toBeGreaterThan(0);
		});

		it("generates requested number of name questions", () => {
			const questions = generatePatternQuestions(5, "name");
			expect(questions.length).toBe(5);
			expect(questions[0].type).toBe("pattern-name");
			const q = questions[0] as PatternNameQuestion;
			expect(q.nameOptions.length).toBe(4);
			expect(q.nameOptions).toContain(q.correctName);
		});

		it("generates mixed questions", () => {
			const questions = generatePatternQuestions(2, "mixed");
			expect(questions[0].type).toBe("pattern-complete");
			expect(questions[1].type).toBe("pattern-name");
		});
	});

	describe("checkPatternCompleteAnswer", () => {
		const mockQuestion = {
			id: "q1",
			type: "pattern-complete" as const,
			patternName: "Major",
			shownPositions: [{ string: 0, fret: 5 }],
			targetPositions: [{ string: 0, fret: 7 }],
			allPositions: [
				{ string: 0, fret: 5 },
				{ string: 0, fret: 7 },
			],
		};

		it("identifies correct selections", () => {
			const res = checkPatternCompleteAnswer(mockQuestion, [{ string: 0, fret: 7 }]);
			expect(res.correct.length).toBe(1);
			expect(res.missed.length).toBe(0);
			expect(res.incorrect.length).toBe(0);
		});

		it("identifies missed selections", () => {
			const res = checkPatternCompleteAnswer(mockQuestion, []);
			expect(res.correct.length).toBe(0);
			expect(res.missed.length).toBe(1);
		});

		it("identifies incorrect selections", () => {
			const res = checkPatternCompleteAnswer(mockQuestion, [{ string: 1, fret: 5 }]);
			expect(res.incorrect.length).toBe(1);
			expect(res.correct.length).toBe(0);
		});
	});

	describe("checkPatternNameAnswer", () => {
		const mockQuestion = {
			id: "q1",
			type: "pattern-name" as const,
			shownPositions: [],
			correctName: "Major",
			nameOptions: ["Major", "Minor", "Blues", "Dorian"],
		};

		it("returns true for correct name", () => {
			expect(checkPatternNameAnswer(mockQuestion, "Major")).toBe(true);
		});

		it("returns false for incorrect name", () => {
			expect(checkPatternNameAnswer(mockQuestion, "Minor")).toBe(false);
		});
	});
});

import { describe, expect, it } from "@jest/globals";
import type { NoteName } from "@/types";
import type { Difficulty } from "./QuizSelector";
import { checkAnswer, generateQuestions, INTERVAL_NAMES } from "./questions";

describe("generateQuestions", () => {
	const difficulty: Difficulty = "beginner";

	it("generates note questions with correct structure", () => {
		const questions = generateQuestions("note", difficulty, 5);
		expect(questions).toHaveLength(5);
		expect(questions[0]).toMatchObject({
			type: "note",
			targetPositions: expect.any(Array),
			targetNote: expect.any(String),
		});
	});

	it("generates note-guess questions with correct structure", () => {
		const questions = generateQuestions("note-guess", difficulty, 3);
		expect(questions).toHaveLength(3);
		expect(questions[0]).toMatchObject({
			type: "note-guess",
			shownPosition: expect.any(Object),
			targetNote: expect.any(String),
			noteOptions: expect.any(Array),
		});
	});

	it("generates interval questions with correct structure", () => {
		const questions = generateQuestions("interval", difficulty, 3);
		expect(questions).toHaveLength(3);
		expect(questions[0]).toMatchObject({
			type: "interval",
			targetPositions: expect.any(Array),
			targetInterval: expect.any(String),
			intervalOptions: expect.any(Array),
		});
	});

	it("generates chord questions with correct structure", () => {
		const questions = generateQuestions("chord", difficulty, 3);
		expect(questions).toHaveLength(3);
		expect(questions[0]).toMatchObject({
			type: "chord",
			targetPositions: expect.any(Array),
			targetChord: expect.any(String),
		});
	});
});

describe("checkAnswer", () => {
	it("correctly evaluates a note question with all correct positions", () => {
		const question = {
			id: "test",
			type: "note" as const,
			targetPositions: [
				{ string: 0, fret: 0 },
				{ string: 5, fret: 12 },
			],
			targetNote: "E",
		};
		const result = checkAnswer(question, question.targetPositions, null, null);
		expect(result.message).toBe("Correct!");
		expect(result.correct).toHaveLength(2);
		expect(result.incorrect).toHaveLength(0);
	});

	it("correctly evaluates a note question with missed positions", () => {
		const question = {
			id: "test",
			type: "note" as const,
			targetPositions: [
				{ string: 0, fret: 0 },
				{ string: 5, fret: 12 },
			],
			targetNote: "E",
		};
		const result = checkAnswer(question, [{ string: 0, fret: 0 }], null, null);
		expect(result.message).toContain("Incorrect");
		expect(result.correct).toHaveLength(1);
		expect(result.missed).toHaveLength(1);
	});

	it("correctly evaluates a note-guess question", () => {
		const question = {
			id: "test",
			type: "note-guess" as const,
			shownPosition: { string: 0, fret: 0 },
			targetNote: "E" as NoteName,
			noteOptions: ["A", "B", "C", "D", "E", "F", "G"],
		};
		const result = checkAnswer(question, [], null, "E");
		expect(result.message).toBe("Correct!");
	});

	it("correctly evaluates an interval question", () => {
		const question = {
			id: "test",
			type: "interval" as const,
			targetPositions: [
				{ string: 0, fret: 0 },
				{ string: 0, fret: 12 },
			],
			targetInterval: "Octave",
			intervalOptions: ["Octave", "P5", "P4"],
		};
		const result = checkAnswer(question, [], "Octave", null);
		expect(result.message).toBe("Correct!");
	});
});

describe("INTERVAL_NAMES", () => {
	it("contains expected intervals", () => {
		expect(INTERVAL_NAMES).toContain("Unison");
		expect(INTERVAL_NAMES).toContain("Octave");
		expect(INTERVAL_NAMES).toContain("P5");
	});
});

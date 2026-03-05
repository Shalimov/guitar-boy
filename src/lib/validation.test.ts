import { validateFretPosition, validateNoteName, validateSRSCard } from "./validation";

describe("validateFretPosition", () => {
	it("returns true for valid positions", () => {
		expect(validateFretPosition({ string: 0, fret: 0 })).toBe(true);
		expect(validateFretPosition({ string: 5, fret: 24 })).toBe(true);
	});

	it("returns false for invalid string", () => {
		expect(validateFretPosition({ string: 6, fret: 5 })).toBe(false);
		expect(validateFretPosition({ string: -1, fret: 5 })).toBe(false);
	});

	it("returns false for invalid fret", () => {
		expect(validateFretPosition({ string: 0, fret: 25 })).toBe(false);
		expect(validateFretPosition({ string: 0, fret: -1 })).toBe(false);
	});

	it("returns false for non-objects", () => {
		expect(validateFretPosition(null)).toBe(false);
		expect(validateFretPosition(undefined)).toBe(false);
		expect(validateFretPosition("string")).toBe(false);
	});
});

describe("validateNoteName", () => {
	it("returns true for valid note names", () => {
		expect(validateNoteName("C")).toBe(true);
		expect(validateNoteName("C#/Db")).toBe(true);
		expect(validateNoteName("B")).toBe(true);
	});

	it("returns false for invalid note names", () => {
		expect(validateNoteName("H")).toBe(false);
		expect(validateNoteName("C#")).toBe(false);
		expect(validateNoteName(123)).toBe(false);
	});
});

describe("validateSRSCard", () => {
	const validCard = {
		id: "note:C:string0",
		category: "note" as const,
		subCategory: "C on low E",
		easeFactor: 2.5,
		intervalDays: 1,
		nextReviewAt: "2026-03-05",
		repetitions: 1,
		lastAccuracy: 0.8,
	};

	it("returns true for valid cards", () => {
		expect(validateSRSCard(validCard)).toBe(true);
	});

	it("returns true for card with null lastAccuracy", () => {
		expect(validateSRSCard({ ...validCard, lastAccuracy: null })).toBe(true);
	});

	it("returns false for invalid easeFactor", () => {
		expect(validateSRSCard({ ...validCard, easeFactor: 5.0 })).toBe(false);
		expect(validateSRSCard({ ...validCard, easeFactor: 1.0 })).toBe(false);
	});

	it("returns false for invalid category", () => {
		expect(validateSRSCard({ ...validCard, category: "invalid" })).toBe(false);
	});

	it("returns false for non-objects", () => {
		expect(validateSRSCard(null)).toBe(false);
		expect(validateSRSCard(undefined)).toBe(false);
	});
});

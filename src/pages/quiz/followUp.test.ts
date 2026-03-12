import { generateFollowUp } from "./followUp";

describe("followUp", () => {
	const pos = { string: 0, fret: 5 }; // A
	const fretRange: [number, number] = [0, 12];
	const visualQuestionTypes = ["note", "note-guess"] as const;

	it.each(
		visualQuestionTypes,
	)("generates ear-check with expected payload for %s", (questionType) => {
		const fu = generateFollowUp(questionType, "A", pos, fretRange);
		expect(fu?.type).toBe("ear-check");
		if (fu?.type === "ear-check") {
			expect(fu.targetNote).toBe("A");
			expect(fu.playPosition).toEqual(pos);
			expect(fu.noteOptions).toContain("A");
			expect(fu.noteOptions).toHaveLength(7);
		}
	});

	it("ear-check options stay within natural-note choices", () => {
		const fu = generateFollowUp("note", "A", pos, fretRange);
		expect(fu?.type).toBe("ear-check");
		if (fu?.type === "ear-check") {
			for (const option of fu.noteOptions) {
				expect(["C", "D", "E", "F", "G", "A", "B"]).toContain(option);
			}
		}
	});

	it("generates fretboard-locate for sound questions", () => {
		const fu = generateFollowUp("note-guess-sound", "D", pos, fretRange);
		expect(fu?.type).toBe("fretboard-locate");
		if (fu?.type === "fretboard-locate") {
			expect(fu.targetNote).toBe("D");
			expect(fu.validPositions.length).toBeGreaterThan(0);
			expect(
				fu.validPositions.every(
					(position) => position.fret >= fretRange[0] && position.fret <= fretRange[1],
				),
			).toBe(true);
		}
	});

	it("returns null for interval questions", () => {
		expect(generateFollowUp("interval", "A", pos, fretRange)).toBeNull();
	});

	it("returns null for chord questions", () => {
		expect(generateFollowUp("chord", "C", pos, fretRange)).toBeNull();
	});
});

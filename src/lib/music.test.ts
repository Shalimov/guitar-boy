import { getNoteAtFret, getSemitoneDistance } from "./music";

describe("getNoteAtFret", () => {
	it("returns open string notes in standard tuning", () => {
		expect(getNoteAtFret({ string: 0, fret: 0 })).toBe("E");
		expect(getNoteAtFret({ string: 1, fret: 0 })).toBe("A");
		expect(getNoteAtFret({ string: 2, fret: 0 })).toBe("D");
		expect(getNoteAtFret({ string: 3, fret: 0 })).toBe("G");
		expect(getNoteAtFret({ string: 4, fret: 0 })).toBe("B");
		expect(getNoteAtFret({ string: 5, fret: 0 })).toBe("E");
	});

	it("returns correct notes on the low E string", () => {
		expect(getNoteAtFret({ string: 0, fret: 1 })).toBe("F");
		expect(getNoteAtFret({ string: 0, fret: 3 })).toBe("G");
		expect(getNoteAtFret({ string: 0, fret: 5 })).toBe("A");
		expect(getNoteAtFret({ string: 0, fret: 12 })).toBe("E");
	});

	it("wraps around after fret 12", () => {
		expect(getNoteAtFret({ string: 0, fret: 24 })).toBe("E");
		expect(getNoteAtFret({ string: 0, fret: 15 })).toBe("G");
	});
});

describe("getSemitoneDistance", () => {
	it("returns 0 for same note", () => {
		expect(getSemitoneDistance("C", "C")).toBe(0);
	});

	it("returns correct semitone distances", () => {
		expect(getSemitoneDistance("C", "E")).toBe(4);
		expect(getSemitoneDistance("C", "G")).toBe(7);
		expect(getSemitoneDistance("A", "C")).toBe(3);
	});
});

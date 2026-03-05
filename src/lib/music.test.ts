import {
	getAllPositionsOfNote,
	getChordTones,
	getInterval,
	getNoteAtFret,
	getSemitoneDistance,
	isChordCorrect,
} from "./music";

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

describe("getInterval", () => {
	it("returns Unison for same position", () => {
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 0 })).toBe("Unison");
	});

	it("returns correct intervals on same string", () => {
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 1 })).toBe("m2");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 2 })).toBe("M2");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 3 })).toBe("m3");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 4 })).toBe("M3");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 5 })).toBe("P4");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 6 })).toBe("Tritone");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 7 })).toBe("P5");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 8 })).toBe("m6");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 9 })).toBe("M6");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 10 })).toBe("m7");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 11 })).toBe("M7");
		expect(getInterval({ string: 0, fret: 0 }, { string: 0, fret: 12 })).toBe("Octave");
	});

	it("handles intervals across different strings", () => {
		expect(getInterval({ string: 0, fret: 0 }, { string: 1, fret: 2 })).toBe("P5");
	});
});

describe("getChordTones", () => {});

describe("getChordTones", () => {
	it("returns correct tones for major triad", () => {
		const tones = getChordTones("C", "major");
		expect(tones).toContain("C");
		expect(tones).toContain("E");
		expect(tones).toContain("G");
		expect(tones).toHaveLength(3);
	});

	it("returns correct tones for minor triad", () => {
		const tones = getChordTones("A", "minor");
		expect(tones).toContain("A");
		expect(tones).toContain("C");
		expect(tones).toContain("E");
		expect(tones).toHaveLength(3);
	});

	it("returns correct tones for diminished triad", () => {
		const tones = getChordTones("B", "diminished");
		expect(tones).toContain("B");
		expect(tones).toContain("D");
		expect(tones).toContain("F");
		expect(tones).toHaveLength(3);
	});

	it("returns correct tones for augmented triad", () => {
		const tones = getChordTones("C", "augmented");
		expect(tones).toContain("C");
		expect(tones).toContain("E");
		expect(tones).toContain("G#/Ab");
		expect(tones).toHaveLength(3);
	});
});

describe("isChordCorrect", () => {
	it("returns true when all required tones present", () => {
		const result = isChordCorrect(
			[
				{ string: 0, fret: 0 },
				{ string: 1, fret: 0 },
				{ string: 2, fret: 9 },
			],
			["E", "A", "B"],
		);
		expect(result.correct).toBe(true);
		expect(result.missing).toHaveLength(0);
		expect(result.extra).toHaveLength(0);
	});

	it("returns false with missing tones", () => {
		const result = isChordCorrect(
			[
				{ string: 0, fret: 0 },
				{ string: 2, fret: 2 },
			],
			["E", "A", "B"],
		);
		expect(result.correct).toBe(false);
		expect(result.missing).toContain("A");
		expect(result.extra).toHaveLength(0);
	});

	it("returns false with missing tones", () => {
		const result = isChordCorrect(
			[
				{ string: 0, fret: 0 },
				{ string: 2, fret: 2 },
			],
			["E", "A", "B"],
		);
		expect(result.correct).toBe(false);
		expect(result.missing).toContain("A");
		expect(result.extra).toHaveLength(0);
	});

	it("identifies extra tones", () => {
		const result = isChordCorrect(
			[
				{ string: 0, fret: 0 },
				{ string: 1, fret: 2 },
				{ string: 2, fret: 2 },
				{ string: 3, fret: 0 },
			],
			["E", "G#/Ab", "B"],
		);
		expect(result.correct).toBe(false);
		expect(result.extra).toContain("G");
	});
});

describe("getAllPositionsOfNote", () => {
	it("finds all E positions in first 12 frets", () => {
		const positions = getAllPositionsOfNote("E", [0, 12]);
		expect(positions).toContainEqual({ string: 0, fret: 0 });
		expect(positions).toContainEqual({ string: 0, fret: 12 });
		expect(positions).toContainEqual({ string: 5, fret: 0 });
		expect(positions).toContainEqual({ string: 5, fret: 12 });
		expect(positions.length).toBeGreaterThan(4);
	});

	it("finds C positions in first 8 frets", () => {
		const positions = getAllPositionsOfNote("C", [0, 8]);
		expect(positions).toContainEqual({ string: 1, fret: 3 });
		expect(positions).toContainEqual({ string: 0, fret: 8 });
		expect(positions).toContainEqual({ string: 5, fret: 8 });
	});

	it("returns empty array for fret range with no matches", () => {
		const positions = getAllPositionsOfNote("E", [1, 1]);
		expect(positions).toHaveLength(0);
	});
});

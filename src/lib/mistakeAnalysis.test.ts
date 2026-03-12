import {
	EMPTY_MISTAKE_LOG,
	fromErrorKey,
	generateHeatMap,
	getTopProblemAreas,
	heatColor,
	recordErrors,
	toErrorKey,
} from "./mistakeAnalysis";

describe("mistakeAnalysis", () => {
	const pos1 = { string: 0, fret: 5 };
	const pos2 = { string: 1, fret: 7 };

	describe("key conversions", () => {
		it("converts position to key and back", () => {
			const key = toErrorKey(pos1);
			expect(key).toBe("s0f5");
			expect(fromErrorKey(key)).toEqual(pos1);
		});

		it("throws for invalid key format", () => {
			expect(() => fromErrorKey("invalid")).toThrow("Invalid error key");
		});
	});

	describe("recordErrors", () => {
		it("records multiple positions", () => {
			const log = recordErrors(EMPTY_MISTAKE_LOG, [pos1, pos2, pos1]);
			expect(log.errors.s0f5).toBe(2);
			expect(log.errors.s1f7).toBe(1);
			expect(log.totalErrors).toBe(3);
		});
	});

	describe("generateHeatMap", () => {
		it("returns zero heat levels for empty log", () => {
			const heatMap = generateHeatMap(EMPTY_MISTAKE_LOG, [0, 2]);
			expect(heatMap).toHaveLength(18);
			expect(heatMap.every((entry) => entry.heatLevel === 0)).toBe(true);
		});

		it("normalizes heat levels", () => {
			const log = recordErrors(EMPTY_MISTAKE_LOG, [pos1, pos1, pos2]);
			// max errors = 2 (pos1)
			const heatMap = generateHeatMap(log, [0, 12]);
			const entry1 = heatMap.find((e) => e.position.string === 0 && e.position.fret === 5);
			const entry2 = heatMap.find((e) => e.position.string === 1 && e.position.fret === 7);

			expect(entry1?.heatLevel).toBe(1);
			expect(entry2?.heatLevel).toBe(0.5);
		});
	});

	describe("getTopProblemAreas", () => {
		it("returns sorted problem areas", () => {
			const log = recordErrors(EMPTY_MISTAKE_LOG, [pos1, pos1, pos2]);
			const top = getTopProblemAreas(log, 5);
			expect(top[0].position).toEqual(pos1);
			expect(top[1].position).toEqual(pos2);
		});
	});

	describe("heatColor", () => {
		it("maps heat level endpoints to expected palettes", () => {
			expect(heatColor(0)).toBe("#22c55e30");
			expect(heatColor(1)).toBe("#dc2626c0");
		});

		it("maps mid ranges to green/yellow", () => {
			expect(heatColor(0.2)).toBe("#22c55e80");
			expect(heatColor(0.5)).toBe("#ca8a04a0");
		});
	});
});

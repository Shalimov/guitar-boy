import {
	calculateHeatMapStats,
	EMPTY_MISTAKE_LOG,
	fromErrorKey,
	generateHeatMap,
	getTopProblemAreas,
	heatColor,
	heatLevelLabel,
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
		it("returns transparent for no heat (level 0)", () => {
			expect(heatColor(0)).toBe("transparent");
		});

		it("returns color-mix values for different heat levels using app design tokens", () => {
			expect(heatColor(0.1)).toBe("color-mix(in srgb, var(--gb-accent) 15%, transparent)");
			expect(heatColor(0.24)).toBe("color-mix(in srgb, var(--gb-accent) 15%, transparent)");
			expect(heatColor(0.25)).toBe("color-mix(in srgb, var(--gb-accent) 35%, transparent)");
			expect(heatColor(0.49)).toBe("color-mix(in srgb, var(--gb-accent) 35%, transparent)");
			expect(heatColor(0.5)).toBe("color-mix(in srgb, var(--gb-accent-strong) 50%, transparent)");
			expect(heatColor(0.74)).toBe("color-mix(in srgb, var(--gb-accent-strong) 50%, transparent)");
			expect(heatColor(0.75)).toBe("color-mix(in srgb, var(--gb-accent-strong) 75%, transparent)");
			expect(heatColor(1)).toBe("color-mix(in srgb, var(--gb-accent-strong) 75%, transparent)");
		});
	});

	describe("heatLevelLabel", () => {
		it("returns correct labels for heat levels", () => {
			expect(heatLevelLabel(0)).toBe("Solid");
			expect(heatLevelLabel(0.1)).toBe("Minor");
			expect(heatLevelLabel(0.24)).toBe("Minor");
			expect(heatLevelLabel(0.25)).toBe("Moderate");
			expect(heatLevelLabel(0.5)).toBe("Significant");
			expect(heatLevelLabel(0.74)).toBe("Significant");
			expect(heatLevelLabel(0.75)).toBe("Critical");
			expect(heatLevelLabel(1)).toBe("Critical");
		});
	});

	describe("calculateHeatMapStats", () => {
		it("returns zero stats for empty log", () => {
			const stats = calculateHeatMapStats(EMPTY_MISTAKE_LOG, [0, 2]);
			expect(stats.totalPositions).toBe(0);
			expect(stats.positionsWithErrors).toBe(0);
			expect(stats.averageErrorsPerPosition).toBe(0);
			expect(stats.totalCells).toBe(18); // 6 strings * 3 frets
			expect(stats.coveragePercent).toBe(0);
			expect(stats.worstString).toBeNull();
		});

		it("calculates stats correctly for log with errors", () => {
			const log = recordErrors(EMPTY_MISTAKE_LOG, [
				{ string: 0, fret: 1 },
				{ string: 0, fret: 1 },
				{ string: 0, fret: 2 },
				{ string: 1, fret: 1 },
			]);
			const stats = calculateHeatMapStats(log, [0, 2]);
			expect(stats.totalPositions).toBe(3);
			expect(stats.positionsWithErrors).toBe(3);
			expect(stats.averageErrorsPerPosition).toBe(4 / 3);
			expect(stats.coveragePercent).toBe(17); // 3 out of 18 positions
			expect(stats.worstString).not.toBeNull();
			expect(stats.worstString?.string).toBe(0);
			expect(stats.worstString?.errorCount).toBe(3);
		});
	});
});

import {
	canvasPointToNearestPosition,
	createCanvasMetrics,
	positionToCanvasPoint,
	positionToCellBounds,
} from "./geometry";

describe("createCanvasMetrics", () => {
	it("normalizes reversed fret ranges", () => {
		const metrics = createCanvasMetrics({
			width: 1200,
			height: 320,
			fretRange: [12, 0],
		});

		expect(metrics.fretRange).toEqual([0, 12]);
		expect(metrics.minFret).toBe(0);
		expect(metrics.maxFret).toBe(12);
		expect(metrics.fretCount).toBe(13);
	});

	it("computes spacing for common fret ranges", () => {
		const shortRange = createCanvasMetrics({
			width: 1200,
			height: 320,
			fretRange: [0, 12],
		});
		const longRange = createCanvasMetrics({
			width: 1200,
			height: 320,
			fretRange: [0, 24],
		});

		expect(shortRange.fretSpacing).toBeGreaterThan(longRange.fretSpacing);
		expect(shortRange.stringSpacing).toBeGreaterThan(0);
		expect(longRange.stringSpacing).toBeGreaterThan(0);
	});
});

describe("positionToCanvasPoint", () => {
	it("maps fret/string coordinates to x/y", () => {
		const metrics = createCanvasMetrics({
			width: 600,
			height: 240,
			fretRange: [0, 12],
		});

		const point = positionToCanvasPoint(metrics, { string: 0, fret: 0 });
		expect(point.x).toBe(metrics.padding.left + metrics.fretSpacing / 2);
		expect(point.y).toBe(metrics.padding.top);
	});

	it("clamps out-of-range positions", () => {
		const metrics = createCanvasMetrics({
			width: 600,
			height: 240,
			fretRange: [0, 12],
		});

		const point = positionToCanvasPoint(metrics, { string: 999, fret: 999 });
		expect(point.x).toBe(metrics.padding.left + (metrics.fretCount - 0.5) * metrics.fretSpacing);
		expect(point.y).toBe(metrics.padding.top + metrics.playableHeight);
	});
});

describe("canvasPointToNearestPosition", () => {
	it("returns expected position at known center points", () => {
		const metrics = createCanvasMetrics({
			width: 1000,
			height: 280,
			fretRange: [0, 12],
		});
		const point = positionToCanvasPoint(metrics, { string: 2, fret: 5 });

		const position = canvasPointToNearestPosition(metrics, point);
		expect(position).toEqual({ string: 2, fret: 5 });
	});

	it("clamps to nearest valid fretboard position", () => {
		const metrics = createCanvasMetrics({
			width: 1000,
			height: 280,
			fretRange: [0, 12],
		});

		expect(canvasPointToNearestPosition(metrics, { x: -500, y: -500 })).toEqual({
			string: 0,
			fret: 0,
		});
		expect(canvasPointToNearestPosition(metrics, { x: 5000, y: 5000 })).toEqual({
			string: 5,
			fret: 12,
		});
	});
});

describe("positionToCellBounds", () => {
	it("returns bounds centered around mapped position", () => {
		const metrics = createCanvasMetrics({
			width: 900,
			height: 260,
			fretRange: [0, 12],
		});

		const bounds = positionToCellBounds(metrics, { string: 3, fret: 7 });
		expect(bounds.position).toEqual({ string: 3, fret: 7 });
		expect(bounds.width).toBeGreaterThan(0);
		expect(bounds.height).toBeGreaterThan(0);
		expect(bounds.center.x).toBeCloseTo(bounds.x + bounds.width / 2);
		expect(bounds.center.y).toBeCloseTo(bounds.y + bounds.height / 2);
	});
});

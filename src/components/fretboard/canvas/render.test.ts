import type { ConnectionLine, MarkedDot } from "@/types";
import { createCanvasMetrics } from "./geometry";
import { drawConnectionLines, drawDots, drawFretboardSurface } from "./render";

function createMockContext(): CanvasRenderingContext2D {
	return {
		clearRect: jest.fn(),
		fillRect: jest.fn(),
		beginPath: jest.fn(),
		moveTo: jest.fn(),
		lineTo: jest.fn(),
		stroke: jest.fn(),
		fill: jest.fn(),
		arc: jest.fn(),
		rect: jest.fn(),
		setLineDash: jest.fn(),
		save: jest.fn(),
		restore: jest.fn(),
		translate: jest.fn(),
		rotate: jest.fn(),
		fillText: jest.fn(),
		strokeStyle: "",
		fillStyle: "",
		lineWidth: 1,
		font: "",
		textAlign: "left",
		textBaseline: "alphabetic",
	} as unknown as CanvasRenderingContext2D;
}

describe("drawFretboardSurface", () => {
	it("draws board primitives and inlay markers", () => {
		const ctx = createMockContext();
		const metrics = createCanvasMetrics({
			width: 1100,
			height: 300,
			fretRange: [0, 12],
		});

		drawFretboardSurface(ctx, metrics);

		expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, metrics.width, metrics.height);
		expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, metrics.width, metrics.height);
		expect(ctx.moveTo).toHaveBeenCalled();
		expect(ctx.lineTo).toHaveBeenCalled();
		expect(ctx.arc).toHaveBeenCalled();
	});
});

describe("drawConnectionLines", () => {
	it("draws solid and dashed line styles", () => {
		const ctx = createMockContext();
		const metrics = createCanvasMetrics({
			width: 1100,
			height: 300,
			fretRange: [0, 12],
		});
		const lines: ConnectionLine[] = [
			{ from: { string: 0, fret: 3 }, to: { string: 2, fret: 5 }, style: "solid" },
			{ from: { string: 1, fret: 7 }, to: { string: 4, fret: 9 }, style: "dashed" },
		];

		drawConnectionLines(ctx, metrics, lines);

		expect(ctx.moveTo).toHaveBeenCalledTimes(2);
		expect(ctx.lineTo).toHaveBeenCalledTimes(2);
		expect(ctx.setLineDash).toHaveBeenCalledWith([6, 4]);
		expect(ctx.setLineDash).toHaveBeenLastCalledWith([]);
	});
});

describe("drawDots", () => {
	it("renders circle, square, and diamond dots with labels", () => {
		const ctx = createMockContext();
		const metrics = createCanvasMetrics({
			width: 1100,
			height: 300,
			fretRange: [0, 12],
		});
		const dots: MarkedDot[] = [
			{ position: { string: 0, fret: 1 }, label: "R" },
			{ position: { string: 2, fret: 4 }, shape: "square" },
			{ position: { string: 4, fret: 9 }, shape: "diamond", label: "5" },
		];

		drawDots(ctx, metrics, dots);

		expect(ctx.fill).toHaveBeenCalled();
		expect(ctx.stroke).toHaveBeenCalled();
		expect(ctx.fillText).toHaveBeenCalledWith("R", expect.any(Number), expect.any(Number));
		expect(ctx.fillText).toHaveBeenCalledWith("5", expect.any(Number), expect.any(Number));
		expect(ctx.save).toHaveBeenCalled();
		expect(ctx.restore).toHaveBeenCalled();
	});

	it("renders target outlines and pattern order badges", () => {
		const ctx = createMockContext();
		const metrics = createCanvasMetrics({
			width: 1100,
			height: 300,
			fretRange: [0, 12],
		});
		const dots: MarkedDot[] = [
			{ position: { string: 0, fret: 1 }, label: "F", order: 1 },
			{ position: { string: 0, fret: 3 }, label: "G", order: 2 },
		];

		drawDots(ctx, metrics, dots, { targetPositions: [{ string: 0, fret: 1 }] });

		expect(ctx.fillText).not.toHaveBeenCalledWith("F", expect.any(Number), expect.any(Number));
		expect(ctx.fillText).toHaveBeenCalledWith("2", expect.any(Number), expect.any(Number));
	});

	it("renders note names when label mode is note", () => {
		const ctx = createMockContext();
		const metrics = createCanvasMetrics({
			width: 1100,
			height: 300,
			fretRange: [0, 12],
		});
		const dots: MarkedDot[] = [{ position: { string: 1, fret: 3 }, label: "R" }];

		drawDots(ctx, metrics, dots, { labelMode: "note" });

		expect(ctx.fillText).toHaveBeenCalledWith("C", expect.any(Number), expect.any(Number));
	});

	it("uses logical string indices for note labels when inversion is enabled", () => {
		const ctx = createMockContext();
		const metrics = createCanvasMetrics({
			width: 1100,
			height: 300,
			fretRange: [1, 15],
		});
		const dots: MarkedDot[] = [{ position: { string: 3, fret: 2 } }];

		drawDots(ctx, metrics, dots, { labelMode: "note", invertStringNotes: true });

		expect(ctx.fillText).toHaveBeenCalledWith("E", expect.any(Number), expect.any(Number));
	});
});

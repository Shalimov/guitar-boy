import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CanvasFretboard } from "./CanvasFretboard";
import * as renderModule from "./canvas/render";

jest.mock("./canvas/render", () => {
	const actual = jest.requireActual("./canvas/render");

	return {
		...actual,
		drawFretboardSurface: jest.fn(actual.drawFretboardSurface),
		drawConnectionLines: jest.fn(actual.drawConnectionLines),
		drawDots: jest.fn(actual.drawDots),
	};
});

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
		setTransform: jest.fn(),
		strokeStyle: "",
		fillStyle: "",
		lineWidth: 1,
		font: "",
		textAlign: "left",
		textBaseline: "alphabetic",
	} as unknown as CanvasRenderingContext2D;
}

describe("CanvasFretboard", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest
			.spyOn(HTMLCanvasElement.prototype, "getContext")
			.mockImplementation(() => createMockContext());
	});

	it("renders canvas plus string/fret labels", () => {
		render(<CanvasFretboard mode="view" fretRange={[1, 3]} />);

		expect(screen.getByRole("img", { name: /guitar fretboard/i })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: /guitar fretboard grid/i })).toBeInTheDocument();
		expect(screen.getByText("E")).toBeInTheDocument();
		expect(screen.getByText("e")).toBeInTheDocument();
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("uses a default range that includes fret 15", () => {
		render(<CanvasFretboard mode="view" />);

		expect(screen.getByRole("button", { name: /string 1 \(E\), fret 15/i })).toBeInTheDocument();
	});

	it("redraws when state changes", () => {
		const drawSurfaceMock = renderModule.drawFretboardSurface as jest.Mock;
		const { rerender } = render(
			<CanvasFretboard mode="view" state={{ dots: [], lines: [] }} fretRange={[1, 5]} />,
		);
		const initialCalls = drawSurfaceMock.mock.calls.length;

		rerender(
			<CanvasFretboard
				mode="view"
				state={{ dots: [{ position: { string: 1, fret: 3 }, label: "R" }], lines: [] }}
				fretRange={[1, 5]}
			/>,
		);

		expect(drawSurfaceMock.mock.calls.length).toBeGreaterThan(initialCalls);
	});

	it("invokes line rendering when state includes lines", () => {
		const drawLinesMock = renderModule.drawConnectionLines as jest.Mock;
		render(
			<CanvasFretboard
				mode="view"
				state={{
					dots: [],
					lines: [{ from: { string: 0, fret: 3 }, to: { string: 2, fret: 5 } }],
				}}
			/>,
		);

		expect(drawLinesMock).toHaveBeenCalled();
		expect(drawLinesMock.mock.calls[0][2]).toHaveLength(1);
	});

	it("calls onFretClick in click-select mode", async () => {
		const onFretClick = jest.fn();
		render(<CanvasFretboard mode="click-select" onFretClick={onFretClick} fretRange={[1, 3]} />);

		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 1/i }));

		expect(onFretClick).toHaveBeenCalledWith({ string: 0, fret: 1 });
	});

	it("uses note-name labels for circles by default", () => {
		const drawDotsMock = renderModule.drawDots as jest.Mock;
		render(
			<CanvasFretboard
				mode="view"
				state={{ dots: [{ position: { string: 1, fret: 3 }, label: "R" }], lines: [] }}
				fretRange={[1, 5]}
			/>,
		);

		const latestCall = drawDotsMock.mock.calls[drawDotsMock.mock.calls.length - 1];
		expect(latestCall[3]).toMatchObject({ labelMode: "note" });
	});

	it("renders target positions as dedicated test-mode circles", () => {
		const drawDotsMock = renderModule.drawDots as jest.Mock;
		render(
			<CanvasFretboard mode="test" targetPositions={[{ string: 0, fret: 4 }]} fretRange={[1, 5]} />,
		);

		const latestCall = drawDotsMock.mock.calls[drawDotsMock.mock.calls.length - 1];
		expect(latestCall[2]).toEqual(
			expect.arrayContaining([expect.objectContaining({ position: { string: 5, fret: 4 } })]),
		);
		expect(latestCall[3]).toMatchObject({
			targetPositions: [{ string: 5, fret: 4 }],
		});
	});

	it("toggles dots in uncontrolled draw mode", async () => {
		const drawDotsMock = renderModule.drawDots as jest.Mock;
		render(<CanvasFretboard mode="draw" fretRange={[1, 3]} />);

		const cell = screen.getByRole("button", { name: /string 1 \(E\), fret 1/i });

		await userEvent.click(cell);
		let latestCall = drawDotsMock.mock.calls[drawDotsMock.mock.calls.length - 1];
		expect(latestCall[2]).toEqual([{ position: { string: 5, fret: 1 } }]);

		await userEvent.click(cell);
		latestCall = drawDotsMock.mock.calls[drawDotsMock.mock.calls.length - 1];
		expect(latestCall[2]).toEqual([]);
	});

	it("calls onLineDrawn when pointer drag starts and ends on existing dots", () => {
		const onLineDrawn = jest.fn();
		render(
			<CanvasFretboard
				mode="draw"
				state={{
					dots: [
						{ position: { string: 0, fret: 1 }, label: "R" },
						{ position: { string: 1, fret: 3 }, label: "5" },
					],
					lines: [],
				}}
				onLineDrawn={onLineDrawn}
				fretRange={[1, 3]}
			/>,
		);

		const start = screen.getByRole("button", { name: /string 1 \(E\), fret 1/i });
		const end = screen.getByRole("button", { name: /string 2 \(A\), fret 3/i });

		fireEvent.pointerDown(start);
		fireEvent.pointerUp(end);

		expect(onLineDrawn).toHaveBeenCalledWith({ string: 0, fret: 1 }, { string: 1, fret: 3 });
	});

	it("groups pattern selections with note labels and sequential lines", async () => {
		const drawDotsMock = renderModule.drawDots as jest.Mock;
		const drawLinesMock = renderModule.drawConnectionLines as jest.Mock;
		render(<CanvasFretboard mode="patterns" fretRange={[1, 4]} />);

		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 1/i }));
		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 3/i }));

		const latestDotsCall = drawDotsMock.mock.calls[drawDotsMock.mock.calls.length - 1];
		expect(latestDotsCall[2]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ position: { string: 5, fret: 1 }, label: "F", order: 1 }),
				expect.objectContaining({ position: { string: 5, fret: 3 }, label: "G", order: 2 }),
			]),
		);

		const latestLinesCall = drawLinesMock.mock.calls[drawLinesMock.mock.calls.length - 1];
		expect(latestLinesCall[2]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					from: { string: 5, fret: 1 },
					to: { string: 5, fret: 3 },
				}),
			]),
		);
	});

	it("falls back to standard tuning labels when string count is invalid", () => {
		render(<CanvasFretboard mode="view" strings={["E"]} fretRange={[1, 1]} />);

		expect(screen.getByText("E")).toBeInTheDocument();
		expect(screen.getByText("e")).toBeInTheDocument();
	});
});

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FretboardState } from "@/types";
import { Fretboard } from "./Fretboard";

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

describe("Fretboard", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest
			.spyOn(HTMLCanvasElement.prototype, "getContext")
			.mockImplementation(() => createMockContext());
	});

	it("renders canvas plus an accessible grid", () => {
		render(<Fretboard mode="view" fretRange={[1, 3]} />);

		expect(screen.getByRole("img", { name: /guitar fretboard/i })).toBeInTheDocument();
		expect(screen.getByRole("table", { name: /guitar fretboard grid/i })).toBeInTheDocument();
	});

	it("uses a default range that includes fret 15", () => {
		render(<Fretboard mode="view" />);

		expect(screen.getByRole("button", { name: /string 1 \(E\), fret 15/i })).toBeInTheDocument();
	});

	it("calls onFretClick with exact position in click-select mode", async () => {
		const onFretClick = jest.fn();
		render(<Fretboard mode="click-select" onFretClick={onFretClick} fretRange={[1, 3]} />);

		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 1/i }));

		expect(onFretClick).toHaveBeenCalledWith({ string: 0, fret: 1 });
	});

	it("supports arrow-key navigation followed by activation", () => {
		const onFretClick = jest.fn();
		render(<Fretboard mode="click-select" onFretClick={onFretClick} fretRange={[1, 3]} />);

		const firstCell = screen.getByRole("button", { name: /string 1 \(E\), fret 1/i });
		const secondCell = screen.getByRole("button", { name: /string 1 \(E\), fret 2/i });

		fireEvent.focus(firstCell);
		fireEvent.keyDown(firstCell, { key: "ArrowRight" });
		expect(secondCell).toHaveAttribute("tabindex", "0");

		fireEvent.keyDown(secondCell, { key: "Enter" });
		expect(onFretClick).toHaveBeenCalledWith({ string: 0, fret: 2 });
	});

	it("maps vertical keyboard movement to inverted string layout", () => {
		const onFretClick = jest.fn();
		render(<Fretboard mode="click-select" onFretClick={onFretClick} fretRange={[1, 3]} />);

		const lowE = screen.getByRole("button", { name: /string 1 \(E\), fret 1/i });
		const aString = screen.getByRole("button", { name: /string 2 \(A\), fret 1/i });

		fireEvent.focus(lowE);
		fireEvent.keyDown(lowE, { key: "ArrowUp" });
		expect(aString).toHaveAttribute("tabindex", "0");

		fireEvent.keyDown(aString, { key: "Enter" });
		expect(onFretClick).toHaveBeenCalledWith({ string: 1, fret: 1 });
	});

	it("fires onLineDrawn when dragging between two existing dots in draw mode", () => {
		const onLineDrawn = jest.fn();
		const state: FretboardState = {
			dots: [
				{ position: { string: 0, fret: 1 }, label: "A" },
				{ position: { string: 0, fret: 3 }, label: "B" },
			],
			lines: [],
		};

		render(<Fretboard mode="draw" state={state} onLineDrawn={onLineDrawn} fretRange={[1, 3]} />);

		const startCell = screen.getByRole("button", { name: /string 1 \(E\), fret 1/i });
		const endCell = screen.getByRole("button", { name: /string 1 \(E\), fret 3/i });

		fireEvent.pointerDown(startCell);
		fireEvent.pointerUp(endCell);

		expect(onLineDrawn).toHaveBeenCalledWith({ string: 0, fret: 1 }, { string: 0, fret: 3 });
	});

	it("reflects parent state updates after initial mount", () => {
		const { rerender } = render(<Fretboard mode="view" state={{ dots: [], lines: [] }} />);

		rerender(
			<Fretboard
				mode="view"
				state={{ dots: [{ position: { string: 0, fret: 1 }, label: "R" }], lines: [] }}
			/>,
		);

		expect(screen.getByRole("button", { name: /fret 1, note F, marker R/i })).toBeInTheDocument();
	});

	it("normalizes reversed fret ranges safely", () => {
		render(<Fretboard mode="view" fretRange={[5, 2]} />);

		expect(screen.getByRole("button", { name: /string 1 \(E\), fret 2/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /string 1 \(E\), fret 5/i })).toBeInTheDocument();
	});

	it("falls back to standard 6-string labels when invalid strings are provided", () => {
		render(<Fretboard mode="view" strings={["E"]} fretRange={[1, 1]} />);

		expect(screen.getByText("E")).toBeInTheDocument();
		expect(screen.getByText("e")).toBeInTheDocument();
	});
});

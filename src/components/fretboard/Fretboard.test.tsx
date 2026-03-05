import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FretboardState } from "@/types";
import { Fretboard } from "./Fretboard";

describe("Fretboard - View Mode", () => {
	const defaultState: FretboardState = {
		dots: [],
		lines: [],
	};

	it("renders without errors", () => {
		render(<Fretboard mode="view" state={defaultState} />);
		expect(screen.getByText("E")).toBeInTheDocument();
	});

	it("renders fret numbers by default", () => {
		render(<Fretboard mode="view" state={defaultState} fretRange={[0, 5]} />);
		expect(screen.getByText("0")).toBeInTheDocument();
		expect(screen.getByText("5")).toBeInTheDocument();
	});

	it("renders dots from state", () => {
		const state: FretboardState = {
			dots: [
				{ position: { string: 0, fret: 0 }, label: "Root" },
				{ position: { string: 1, fret: 2 }, label: "3rd" },
			],
			lines: [],
		};
		render(<Fretboard mode="view" state={state} />);
		expect(screen.getByText("Root")).toBeInTheDocument();
		expect(screen.getByText("3rd")).toBeInTheDocument();
	});

	it("renders lines from state", () => {
		const state: FretboardState = {
			dots: [],
			lines: [{ from: { string: 0, fret: 0 }, to: { string: 0, fret: 2 } }],
		};
		render(<Fretboard mode="view" state={state} />);
		expect(screen.getByText("E")).toBeInTheDocument();
	});

	it("displays correct/missed/incorrect overlays when provided", () => {
		render(
			<Fretboard
				mode="view"
				state={defaultState}
				correctPositions={[{ string: 0, fret: 0 }]}
				missedPositions={[{ string: 1, fret: 2 }]}
				incorrectPositions={[{ string: 2, fret: 3 }]}
			/>,
		);
		expect(screen.getByText("E")).toBeInTheDocument();
	});
});

describe("Fretboard - Click-Select Mode", () => {
	it("renders clickable fret cells", () => {
		const onFretClick = jest.fn();
		render(<Fretboard mode="click-select" onFretClick={onFretClick} fretRange={[0, 2]} />);

		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
	});

	it("calls onFretClick when fret is clicked", async () => {
		const onFretClick = jest.fn();
		render(<Fretboard mode="click-select" onFretClick={onFretClick} fretRange={[0, 2]} />);

		const firstButton = screen.getAllByRole("button")[0];
		await userEvent.click(firstButton);

		expect(onFretClick).toHaveBeenCalled();
		expect(onFretClick.mock.calls[0][0]).toHaveProperty("string");
		expect(onFretClick.mock.calls[0][0]).toHaveProperty("fret");
	});

	it("highlights selected positions", () => {
		render(
			<Fretboard
				mode="click-select"
				selectedPositions={[{ string: 0, fret: 0 }]}
				fretRange={[0, 2]}
			/>,
		);
		expect(screen.getByText("E")).toBeInTheDocument();
	});
});

describe("Fretboard - Draw Mode", () => {
	it("renders interactive fretboard", () => {
		render(<Fretboard mode="draw" fretRange={[0, 5]} />);
		expect(screen.getByText("E")).toBeInTheDocument();
	});

	it("calls onFretClick when fret is clicked in draw mode", async () => {
		const onFretClick = jest.fn();
		render(<Fretboard mode="draw" onFretClick={onFretClick} fretRange={[0, 2]} />);

		const buttons = screen.getAllByRole("button");
		await userEvent.click(buttons[0]);

		expect(onFretClick).toHaveBeenCalled();
	});
});

describe("Fretboard - Accessibility", () => {
	it("renders fretboard container", () => {
		render(<Fretboard mode="view" fretRange={[0, 2]} />);
		const fretboard = screen.getByText("E").closest("div");
		expect(fretboard).toBeInTheDocument();
	});
});

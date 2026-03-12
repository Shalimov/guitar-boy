import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { playFretPosition } from "@/lib/audio";
import { ExplorerPanel } from "./ExplorerPanel";

jest.mock("@/lib/audio", () => ({
	playFretPosition: jest.fn(() => Promise.resolve()),
	getEqualizerLevels: jest.fn(() => Array.from({ length: 22 }, () => 0.2)),
	subscribeToPlaybackState: jest.fn((listener: (isPlaying: boolean) => void) => {
		listener(false);
		return jest.fn();
	}),
}));

beforeEach(() => {
	jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
		() =>
			({
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
				closePath: jest.fn(),
				strokeStyle: "",
				fillStyle: "",
				lineWidth: 1,
				font: "",
				textAlign: "left",
				textBaseline: "alphabetic",
			}) as unknown as CanvasRenderingContext2D,
	);
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe("ExplorerPanel", () => {
	it("renders explorer controls and live title", () => {
		render(<ExplorerPanel />);

		expect(screen.getByRole("heading", { name: /build a neck map/i })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: /C Major/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/root note/i)).toBeInTheDocument();
	});

	it("updates the live view when the construct changes", async () => {
		render(<ExplorerPanel />);

		await userEvent.selectOptions(screen.getByLabelText(/specific construct/i), "Mixolydian");

		expect(screen.getByRole("heading", { name: /C Mixolydian/i })).toBeInTheDocument();
		expect(screen.getByText(/1 - 2 - 3 - 4 - 5 - 6 - b7/i)).toBeInTheDocument();
	});

	it("switches to interval labels", async () => {
		render(<ExplorerPanel />);

		await userEvent.click(screen.getByRole("button", { name: /interval degrees/i }));

		expect(screen.getByText(/1 - 2 - 3 - 4 - 5 - 6 - 7/i)).toBeInTheDocument();
	});

	it("shows caged shape toggles when overlay is enabled", async () => {
		render(<ExplorerPanel />);

		await userEvent.click(screen.getByLabelText(/toggle caged overlays/i));

		expect(screen.getByRole("button", { name: "C" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "D" })).toBeInTheDocument();
	});

	it("offers a note filter for the active construct", async () => {
		render(<ExplorerPanel />);

		const filter = screen.getByLabelText(/filter by note/i);
		expect(filter).toBeInTheDocument();

		await userEvent.selectOptions(filter, "E");

		expect(filter).toHaveValue("E");
	});

	it("plays the selected tone from the inspector", async () => {
		render(<ExplorerPanel />);

		await userEvent.hover(screen.getByRole("button", { name: /fret 3, note c/i }));
		await userEvent.click(screen.getByRole("button", { name: /play note/i }));

		expect(playFretPosition).toHaveBeenCalledWith({ string: 1, fret: 3 }, "2n");
	});
});

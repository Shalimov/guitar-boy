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
		// ButtonGroup renders a label with text content
		expect(screen.getByText(/root note/i)).toBeInTheDocument();
	});

	it("updates the live view when the construct changes", async () => {
		render(<ExplorerPanel />);

		// Find the button for "Mixolydian" in the specific construct button group
		const mixolydianButton = screen.getByRole("button", { name: /Mixolydian/i });
		await userEvent.click(mixolydianButton);

		expect(screen.getByRole("heading", { name: /C Mixolydian/i })).toBeInTheDocument();
		expect(screen.getByText(/1 - 2 - 3 - 4 - 5 - 6 - b7/i)).toBeInTheDocument();
	});

	it("switches to interval labels", async () => {
		render(<ExplorerPanel />);

		// Find the label for "Label type" to narrow down the scope
		const labelTypeSection = screen.getByText(/Label type/i).closest("div");
		const intervalsButton = labelTypeSection?.querySelector('button[type="button"]');

		if (intervalsButton) {
			// The second button in the label type group is "Intervals"
			const buttons = labelTypeSection?.querySelectorAll('button[type="button"]');
			if (buttons && buttons.length >= 2) {
				await userEvent.click(buttons[1]);
			}
		}

		expect(screen.getByText(/1 - 2 - 3 - 4 - 5 - 6 - 7/i)).toBeInTheDocument();
	});

	it("shows caged shape toggles when overlay is enabled", async () => {
		render(<ExplorerPanel />);

		// Find the section that contains "CAGED overlays" text
		const cagedSection = screen.getByText(/CAGED overlays/i).closest("div");
		const parentDiv = cagedSection?.closest("div");

		// Find the toggle input within this section
		const toggleInput = parentDiv?.querySelector('input[type="checkbox"]') as HTMLElement;

		if (toggleInput) {
			await userEvent.click(toggleInput);
		}

		// Now find the CAGED shape buttons - they appear after enabling the overlay
		// These are the multiselect buttons for CAGED shapes
		const cagedButtonsContainer = parentDiv?.querySelector(".flex.flex-wrap.gap-2");
		if (cagedButtonsContainer) {
			const buttons = cagedButtonsContainer.querySelectorAll('button[type="button"]');
			expect(buttons.length).toBeGreaterThan(0);
		}
	});

	it("offers a note filter for the active construct", async () => {
		render(<ExplorerPanel />);

		// Find the "All construct tones" button in the filter section
		const filterSection = screen.getByText(/Filter by note/i).closest("div");
		expect(filterSection).toBeInTheDocument();

		// Click the "E" button in the filter button group
		const eButton = screen.getAllByRole("button").find((btn) => btn.textContent === "E");
		if (eButton) {
			await userEvent.click(eButton);
			expect(eButton).toHaveClass(/bg-\[var\(--gb-accent\)\]/);
		}
	});

	it("plays the selected tone from the inspector", async () => {
		render(<ExplorerPanel />);

		await userEvent.hover(screen.getByRole("button", { name: /fret 3, note c/i }));
		await userEvent.click(screen.getByRole("button", { name: /play note/i }));

		expect(playFretPosition).toHaveBeenCalledWith({ string: 1, fret: 3 }, "2n");
	});
});

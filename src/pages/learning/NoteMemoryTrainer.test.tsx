import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { playFretPosition } from "@/lib/audio";
import { NoteMemoryTrainer } from "./NoteMemoryTrainer";

jest.mock("@/lib/audio", () => ({
	playFretPosition: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
	localStorage.clear();
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
	jest.clearAllMocks();
});

describe("NoteMemoryTrainer", () => {
	it("renders the practice controls and note options", () => {
		render(<NoteMemoryTrainer />);

		expect(
			screen.getByRole("heading", { name: /train note memory two ways/i }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /name the note/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /hear then name/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "C" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
	});

	it("plays the prompt automatically in sound mode", async () => {
		render(<NoteMemoryTrainer />);

		await userEvent.click(screen.getByRole("button", { name: /hear then name/i }));

		expect(playFretPosition).toHaveBeenCalledTimes(1);
		expect(playFretPosition).toHaveBeenCalledWith(
			expect.objectContaining({ string: expect.any(Number), fret: expect.any(Number) }),
			"4n",
		);
	});

	it("checks an answer and lets the user continue", async () => {
		render(<NoteMemoryTrainer />);

		await userEvent.click(screen.getByRole("button", { name: "C" }));
		await userEvent.click(screen.getByRole("button", { name: /check answer/i }));

		expect(screen.getByText(/correct\. say it once more|not quite\. this is/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /next prompt/i })).toBeInTheDocument();
	});

	it("reads persisted stats on load", () => {
		localStorage.setItem(
			"guitar-boy.note-memory-trainer.stats",
			JSON.stringify({ attempts: 8, correct: 6, streak: 2, bestStreak: 4 }),
		);

		render(<NoteMemoryTrainer />);

		expect(screen.getByTestId("trainer-stat-attempts")).toHaveTextContent("8");
		expect(screen.getByTestId("trainer-stat-accuracy")).toHaveTextContent("75%");
		expect(screen.getByTestId("trainer-stat-streak")).toHaveTextContent("2");
		expect(screen.getByTestId("trainer-stat-best-streak")).toHaveTextContent("4");
	});

	it("prioritizes notes with more mistakes when picking prompts", async () => {
		jest.spyOn(Math, "random").mockReturnValueOnce(0.4).mockReturnValue(0);
		localStorage.setItem(
			"guitar-boy.note-memory-trainer.stats",
			JSON.stringify({
				attempts: 12,
				correct: 5,
				streak: 0,
				bestStreak: 2,
				mistakesByPosition: { "1-3": 10 },
			}),
		);

		render(<NoteMemoryTrainer />);

		await userEvent.click(screen.getByRole("button", { name: "D" }));
		await userEvent.click(screen.getByRole("button", { name: /check answer/i }));

		expect(screen.getByText(/this is c\./i)).toBeInTheDocument();
	});

	it("resets persisted stats", async () => {
		localStorage.setItem(
			"guitar-boy.note-memory-trainer.stats",
			JSON.stringify({
				attempts: 8,
				correct: 6,
				streak: 2,
				bestStreak: 4,
				mistakesByPosition: { "3-0": 3 },
			}),
		);

		render(<NoteMemoryTrainer />);

		await userEvent.click(screen.getByRole("button", { name: /reset stats/i }));

		expect(localStorage.getItem("guitar-boy.note-memory-trainer.stats")).toBe(
			JSON.stringify({ attempts: 0, correct: 0, streak: 0, bestStreak: 0, mistakesByPosition: {} }),
		);
	});
});

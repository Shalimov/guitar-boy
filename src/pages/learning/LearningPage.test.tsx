import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LearningPage } from "./LearningPage";

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

describe("LearningPage", () => {
	it("switches from lessons to the note trainer", async () => {
		render(<LearningPage />);

		await userEvent.click(screen.getByRole("button", { name: /trainer/i }));

		expect(screen.getByRole("heading", { name: /note memory trainer/i })).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /train note memory two ways/i }),
		).toBeInTheDocument();
	});
});

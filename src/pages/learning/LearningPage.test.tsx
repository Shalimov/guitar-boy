import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
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

function renderLearningPage(initialEntry = "/learn") {
	const router = createMemoryRouter(
		[
			{
				path: "/learn/*",
				element: <LearningPage />,
			},
		],
		{ initialEntries: [initialEntry] },
	);

	return { ...render(<RouterProvider router={router} />), router };
}

describe("LearningPage", () => {
	it("switches from lessons to the note trainer", async () => {
		const { router } = renderLearningPage();

		await userEvent.click(screen.getByRole("button", { name: /trainer/i }));
		await screen.findByRole("heading", { name: /note memory trainer/i });

		expect(screen.getByRole("heading", { name: /note memory trainer/i })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: /practice loop/i })).toBeInTheDocument();
		expect(router.state.location.pathname).toBe("/learn/trainer");
	});

	it("restores trainer tab from the url", () => {
		renderLearningPage("/learn/trainer");

		expect(screen.getByRole("heading", { name: /note memory trainer/i })).toBeInTheDocument();
	});
});

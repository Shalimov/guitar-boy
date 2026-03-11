import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QuizPage } from "./QuizPage";

function renderQuizPage(initialEntry = "/quiz") {
	const router = createMemoryRouter(
		[
			{
				path: "/quiz/*",
				element: <QuizPage />,
			},
		],
		{ initialEntries: [initialEntry] },
	);

	return { ...render(<RouterProvider router={router} />), router };
}

describe("QuizPage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("opens review mode on the review route", () => {
		localStorage.setItem(
			"guitar-boy-progress",
			JSON.stringify({
				version: 1,
				cards: {
					"note:C": {
						id: "note:C",
						category: "note",
						subCategory: "C",
						easeFactor: 2.5,
						intervalDays: 1,
						nextReviewAt: "2020-01-01",
						repetitions: 0,
						lastAccuracy: 0.5,
					},
				},
				sessionHistory: [],
				settings: {
					accidentalPreference: "sharp",
					fretRange: { min: 1, max: 15 },
				},
			}),
		);

		renderQuizPage("/quiz/review");

		expect(screen.getByRole("heading", { name: /review due cards/i })).toBeInTheDocument();
	});

	it("navigates to review route from the review card", async () => {
		localStorage.setItem(
			"guitar-boy-progress",
			JSON.stringify({
				version: 1,
				cards: {
					"note:C": {
						id: "note:C",
						category: "note",
						subCategory: "C",
						easeFactor: 2.5,
						intervalDays: 1,
						nextReviewAt: "2020-01-01",
						repetitions: 0,
						lastAccuracy: 0.5,
					},
				},
				sessionHistory: [],
				settings: {
					accidentalPreference: "sharp",
					fretRange: { min: 1, max: 15 },
				},
			}),
		);

		const { router } = renderQuizPage();

		await userEvent.click(screen.getByRole("button", { name: /start review/i }));

		expect(router.state.location.pathname).toBe("/quiz/review");
	});
});

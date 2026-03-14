import { render, screen } from "@testing-library/react";
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

	it("renders quiz selector on default route", () => {
		renderQuizPage();
		expect(screen.getByRole("heading", { name: /quiz studio/i })).toBeInTheDocument();
	});
});

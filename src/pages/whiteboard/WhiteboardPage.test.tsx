import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { WhiteboardPage } from "./WhiteboardPage";

function renderWithRouter(initialEntry = "/whiteboard") {
	const router = createMemoryRouter(
		[
			{
				path: "/whiteboard/*",
				element: <WhiteboardPage />,
			},
		],
		{ initialEntries: [initialEntry] },
	);

	return { ...render(<RouterProvider router={router} />), router };
}

describe("WhiteboardPage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("renders whiteboard title", () => {
		renderWithRouter();
		expect(screen.getByRole("heading", { name: /whiteboard/i })).toBeInTheDocument();
	});

	it("shows My Diagrams and Pattern Library tabs", () => {
		renderWithRouter();
		expect(screen.getByRole("button", { name: /my diagrams/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /pattern library/i })).toBeInTheDocument();
	});

	it("shows empty state when no diagrams", () => {
		renderWithRouter();
		expect(screen.getByText(/no diagrams yet/i)).toBeInTheDocument();
	});

	it("navigates to new diagram editor when New Diagram clicked", async () => {
		const { router } = renderWithRouter();

		await userEvent.click(screen.getByRole("button", { name: /new diagram/i }));
		await screen.findByRole("heading", { name: /new diagram/i });

		expect(screen.getByRole("heading", { name: /new diagram/i })).toBeInTheDocument();
		expect(router.state.location.pathname).toBe("/whiteboard/edit/new");
	});

	it("switches to Pattern Library tab", async () => {
		const { router } = renderWithRouter();

		await userEvent.click(screen.getByRole("button", { name: /pattern library/i }));

		expect(screen.getByText("CAGED Shapes")).toBeInTheDocument();
		expect(router.state.location.pathname).toBe("/whiteboard/patterns");
	});

	it("shows diagram count in My Diagrams tab", () => {
		renderWithRouter();
		expect(screen.getByText(/\(0\)/)).toBeInTheDocument();
	});

	it("has Create Diagram button in empty state", async () => {
		const { router } = renderWithRouter();

		await userEvent.click(screen.getByRole("button", { name: /create diagram/i }));
		await screen.findByRole("heading", { name: /new diagram/i });

		expect(screen.getByRole("heading", { name: /new diagram/i })).toBeInTheDocument();
		expect(router.state.location.pathname).toBe("/whiteboard/edit/new");
	});
});

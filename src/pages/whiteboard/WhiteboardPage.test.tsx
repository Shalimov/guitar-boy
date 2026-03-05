import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { WhiteboardPage } from "./WhiteboardPage";

const renderWithRouter = (component: React.ReactElement) => {
	const router = createMemoryRouter([
		{
			path: "/",
			element: component,
		},
	]);

	return render(<RouterProvider router={router} />);
};

describe("WhiteboardPage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("renders whiteboard title", () => {
		renderWithRouter(<WhiteboardPage />);
		expect(screen.getByRole("heading", { name: /whiteboard/i })).toBeInTheDocument();
	});

	it("shows My Diagrams and Pattern Library tabs", () => {
		renderWithRouter(<WhiteboardPage />);
		expect(screen.getByRole("button", { name: /my diagrams/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /pattern library/i })).toBeInTheDocument();
	});

	it("shows empty state when no diagrams", () => {
		renderWithRouter(<WhiteboardPage />);
		expect(screen.getByText(/no diagrams yet/i)).toBeInTheDocument();
	});

	it("navigates to new diagram editor when New Diagram clicked", async () => {
		renderWithRouter(<WhiteboardPage />);

		const newButton = screen.getByRole("button", { name: /new diagram/i });
		await userEvent.click(newButton);

		expect(screen.getByRole("heading", { name: /new diagram/i })).toBeInTheDocument();
	});

	it("switches to Pattern Library tab", async () => {
		renderWithRouter(<WhiteboardPage />);

		const patternsTab = screen.getByRole("button", { name: /pattern library/i });
		await userEvent.click(patternsTab);

		expect(screen.getByText("Built-in Patterns")).toBeInTheDocument();
	});

	it("shows diagram count in My Diagrams tab", () => {
		renderWithRouter(<WhiteboardPage />);
		expect(screen.getByText(/\(0\)/)).toBeInTheDocument();
	});

	it("has Create Diagram button in empty state", async () => {
		renderWithRouter(<WhiteboardPage />);

		const createButton = screen.getByRole("button", { name: /create diagram/i });
		await userEvent.click(createButton);

		expect(screen.getByRole("heading", { name: /new diagram/i })).toBeInTheDocument();
	});
});

import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { DashboardPage } from "./DashboardPage";

const renderWithRouter = (component: React.ReactElement, route = "/") => {
	const router = createMemoryRouter(
		[
			{
				path: "/",
				element: component,
			},
			{
				path: "/quiz",
				element: <div>Quiz Page</div>,
			},
			{
				path: "/learn",
				element: <div>Learn Page</div>,
			},
			{
				path: "/whiteboard",
				element: <div>Whiteboard Page</div>,
			},
		],
		{
			initialEntries: [route],
		},
	);

	return { ...render(<RouterProvider router={router} />), router };
};

describe("DashboardPage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("renders dashboard title", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
	});

	it("renders four progress cards", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getByText("Notes")).toBeInTheDocument();
		expect(screen.getByText("Intervals")).toBeInTheDocument();
		expect(screen.getByText("Chords")).toBeInTheDocument();
		expect(screen.getByText("Due for Review")).toBeInTheDocument();
	});

	it("displays onboarding panel when no sessions", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getByText(/new here\? start a warmup/i)).toBeInTheDocument();
	});

	it("has Start Learning button", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getByRole("button", { name: /start learning/i })).toBeInTheDocument();
	});

	it("has Explore Whiteboard button", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getByRole("button", { name: /explore whiteboard/i })).toBeInTheDocument();
	});

	it("shows 0% accuracy for empty session history", () => {
		renderWithRouter(<DashboardPage />);
		const accuracyDisplays = screen.getAllByText("0%");
		expect(accuracyDisplays).toHaveLength(3);
	});

	it("shows 0 due cards initially", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getByText("0 cards due today")).toBeInTheDocument();
	});
});

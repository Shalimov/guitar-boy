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
		// Use getAllByText because these terms appear in the roadmap too
		expect(screen.getAllByText("Notes").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Intervals").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Chords").length).toBeGreaterThan(0);
		expect(screen.getByText("Due for Review")).toBeInTheDocument();
	});

	it("displays onboarding panel when no sessions", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getByText(/Your Learning Roadmap/i)).toBeInTheDocument();
	});

	it("has Start Daily Practice button", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getByRole("button", { name: /start daily practice/i })).toBeInTheDocument();
	});

	it("has Explore Whiteboard button", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getAllByRole("button", { name: /explore whiteboard/i }).length).toBeGreaterThan(
			0,
		);
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

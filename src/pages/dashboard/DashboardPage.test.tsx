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

	it("displays stats section", () => {
		renderWithRouter(<DashboardPage />);
		expect(screen.getByText(/Sessions today/i)).toBeInTheDocument();
		expect(screen.getByText(/Tracked sessions/i)).toBeInTheDocument();
	});
});

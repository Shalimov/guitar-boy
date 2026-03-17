import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { Layout } from "./Layout";

const renderWithRouter = (component: React.ReactElement, route = "/") => {
	const router = createMemoryRouter(
		[
			{
				path: "/",
				element: component,
			},
		],
		{
			initialEntries: [route],
		},
	);

	return render(<RouterProvider router={router} />);
};

describe("Layout", () => {
	it("renders app title", () => {
		renderWithRouter(<Layout />);
		expect(screen.getAllByText("Guitar Boy").length).toBeGreaterThan(0);
	});

	it("renders navigation links", () => {
		renderWithRouter(<Layout />);
		expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /whiteboard/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /learn/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /quiz/i })).toBeInTheDocument();
	});

	it("renders GitHub repo link when env var is set", () => {
		const previous = process.env.GITHUB_REPO_URL;
		process.env.GITHUB_REPO_URL = "https://github.com/igorshalimov/guitar-boy";
		renderWithRouter(<Layout />);
		expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
			"href",
			"https://github.com/igorshalimov/guitar-boy",
		);
		if (previous === undefined) {
			delete process.env.GITHUB_REPO_URL;
		} else {
			process.env.GITHUB_REPO_URL = previous;
		}
	});

	it("has main content area", () => {
		renderWithRouter(<Layout />);
		expect(screen.getByRole("main")).toBeInTheDocument();
	});
});

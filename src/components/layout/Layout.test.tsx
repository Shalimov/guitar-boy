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

	it("has main content area", () => {
		renderWithRouter(<Layout />);
		expect(screen.getByRole("main")).toBeInTheDocument();
	});
});

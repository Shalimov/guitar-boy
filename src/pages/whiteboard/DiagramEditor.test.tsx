import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { Diagram } from "@/types";
import { DiagramEditor } from "./DiagramEditor";

const mockDiagram: Diagram = {
	id: "test-1",
	name: "Test Diagram",
	createdAt: "2026-03-04T00:00:00Z",
	updatedAt: "2026-03-04T00:00:00Z",
	fretboardState: {
		dots: [],
		lines: [],
	},
	isBuiltIn: false,
};

const renderWithRouter = (component: React.ReactElement) => {
	const router = createMemoryRouter([
		{
			path: "/",
			element: component,
		},
	]);

	return render(<RouterProvider router={router} />);
};

describe("DiagramEditor", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("renders diagram name input", () => {
		renderWithRouter(
			<DiagramEditor diagram={mockDiagram} onSave={jest.fn()} onCancel={jest.fn()} />,
		);
		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
	});

	it("renders save and cancel buttons", () => {
		renderWithRouter(
			<DiagramEditor diagram={mockDiagram} onSave={jest.fn()} onCancel={jest.fn()} />,
		);
		expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
	});

	it("calls onSave with updated diagram", async () => {
		const onSave = jest.fn();
		renderWithRouter(<DiagramEditor diagram={mockDiagram} onSave={onSave} onCancel={jest.fn()} />);

		const nameInput = screen.getByLabelText(/name/i);
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, "New Name");

		const saveButton = screen.getByRole("button", { name: /save/i });
		await userEvent.click(saveButton);

		expect(onSave).toHaveBeenCalled();
		expect(onSave.mock.calls[0][0].name).toBe("New Name");
	});

	it("calls onCancel when cancel clicked", async () => {
		const onCancel = jest.fn();
		renderWithRouter(
			<DiagramEditor diagram={mockDiagram} onSave={jest.fn()} onCancel={onCancel} />,
		);

		const cancelButton = screen.getByRole("button", { name: /cancel/i });
		await userEvent.click(cancelButton);

		expect(onCancel).toHaveBeenCalled();
	});

	it("renders fretboard in draw mode", () => {
		renderWithRouter(<DiagramEditor onSave={jest.fn()} onCancel={jest.fn()} />);
		expect(screen.getByText("E")).toBeInTheDocument();
	});
});

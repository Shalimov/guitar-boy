import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { Diagram } from "@/types";
import { DiagramEditor } from "./DiagramEditor";

function createMockContext(): CanvasRenderingContext2D {
	return {
		clearRect: jest.fn(),
		fillRect: jest.fn(),
		beginPath: jest.fn(),
		moveTo: jest.fn(),
		lineTo: jest.fn(),
		stroke: jest.fn(),
		fill: jest.fn(),
		arc: jest.fn(),
		rect: jest.fn(),
		closePath: jest.fn(),
		setLineDash: jest.fn(),
		save: jest.fn(),
		restore: jest.fn(),
		translate: jest.fn(),
		rotate: jest.fn(),
		fillText: jest.fn(),
		setTransform: jest.fn(),
		strokeStyle: "",
		fillStyle: "",
		lineWidth: 1,
		font: "",
		textAlign: "left",
		textBaseline: "alphabetic",
	} as unknown as CanvasRenderingContext2D;
}

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
		jest.clearAllMocks();
		jest
			.spyOn(HTMLCanvasElement.prototype, "getContext")
			.mockImplementation(() => createMockContext());
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

	it("creates a group from selected markers and persists it on save", async () => {
		const onSave = jest.fn();
		renderWithRouter(<DiagramEditor diagram={mockDiagram} onSave={onSave} onCancel={jest.fn()} />);

		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 1, note/i }));
		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 3, note/i }));

		await userEvent.click(screen.getByRole("button", { name: /select markers/i }));
		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 1, note/i }));
		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 3, note/i }));
		await userEvent.click(screen.getByRole("button", { name: /group selected/i }));

		await userEvent.click(screen.getByRole("button", { name: /save/i }));

		expect(onSave).toHaveBeenCalled();
		expect(onSave.mock.calls[0][0].fretboardState.groups).toHaveLength(1);
		expect(onSave.mock.calls[0][0].fretboardState.groups?.[0]).toMatchObject({
			positions: [
				{ string: 0, fret: 1 },
				{ string: 0, fret: 3 },
			],
		});
	});

	it("persists dot and group metadata from toolbar controls", async () => {
		const onSave = jest.fn();
		renderWithRouter(<DiagramEditor onSave={onSave} onCancel={jest.fn()} />);

		await userEvent.type(screen.getByLabelText(/name/i), "Metadata Diagram");

		const colorInputs = screen.getAllByLabelText(/color/i);
		fireEvent.change(colorInputs[0], { target: { value: "#ff0000" } });
		await userEvent.type(screen.getByLabelText(/dot label/i), "R");
		await userEvent.selectOptions(screen.getByLabelText(/dot shape/i), "square");

		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 1, note/i }));
		await userEvent.click(screen.getByRole("button", { name: /string 2 \(A\), fret 3, note/i }));

		await userEvent.click(screen.getByRole("button", { name: /select markers/i }));
		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 1, note/i }));
		await userEvent.click(screen.getByRole("button", { name: /string 2 \(A\), fret 3, note/i }));
		await userEvent.click(screen.getByRole("button", { name: /group selected/i }));
		await userEvent.click(screen.getByRole("button", { name: /save/i }));

		const savedDiagram = onSave.mock.calls[0][0];
		expect(savedDiagram.fretboardState.dots[0]).toMatchObject({
			position: { string: 0, fret: 1 },
			label: "R",
			color: "#ff0000",
			shape: "square",
		});
	});

	it("shows selection mode button and controls", async () => {
		renderWithRouter(<DiagramEditor onSave={jest.fn()} onCancel={jest.fn()} />);

		expect(screen.getByRole("button", { name: /select markers/i })).toBeInTheDocument();
	});

	it("selection mode allows selecting markers for grouping", async () => {
		renderWithRouter(<DiagramEditor onSave={jest.fn()} onCancel={jest.fn()} />);

		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 1, note/i }));
		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 3, note/i }));

		await userEvent.click(screen.getByRole("button", { name: /select markers/i }));

		expect(screen.getByText("0 selected")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 1, note/i }));
		expect(screen.getByText("1 selected")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: /string 1 \(E\), fret 3, note/i }));
		expect(screen.getByText("2 selected")).toBeInTheDocument();

		expect(screen.getByRole("button", { name: /group selected/i })).toBeEnabled();
	});

	it("prompts before cancel when there are unsaved changes", async () => {
		const onCancel = jest.fn();

		renderWithRouter(
			<DiagramEditor diagram={mockDiagram} onSave={jest.fn()} onCancel={onCancel} />,
		);

		await userEvent.clear(screen.getByLabelText(/name/i));
		await userEvent.type(screen.getByLabelText(/name/i), "Changed Name");
		await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

		expect(screen.getByText("Discard Changes")).toBeInTheDocument();
		expect(onCancel).not.toHaveBeenCalled();

		await userEvent.click(screen.getByRole("button", { name: /discard/i }));
		expect(onCancel).toHaveBeenCalled();
	});
});

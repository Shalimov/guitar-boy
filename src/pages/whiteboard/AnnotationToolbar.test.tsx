import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnnotationToolbar } from "./AnnotationToolbar";

describe("AnnotationToolbar", () => {
	const defaultProps = {
		dotColor: "#3B82F6",
		dotLabel: "",
		dotShape: "circle" as const,
		groupColor: "#8B5CF6",
		selectedGroupCount: 0,
		canCreateGroup: false,
		onDotColorChange: jest.fn(),
		onDotLabelChange: jest.fn(),
		onDotShapeChange: jest.fn(),
		onGroupColorChange: jest.fn(),
		onCreateGroup: jest.fn(),
		onClearSelection: jest.fn(),
	};

	it("renders marker and group sections", () => {
		render(<AnnotationToolbar {...defaultProps} />);
		expect(screen.getByText(/^markers$/i)).toBeInTheDocument();
		expect(screen.getByText(/^groups$/i)).toBeInTheDocument();
	});

	it("shows marker controls", () => {
		render(<AnnotationToolbar {...defaultProps} />);
		expect(screen.getByLabelText(/dot label/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/dot shape/i)).toBeInTheDocument();
		expect(screen.getAllByLabelText(/^color$/i)).toHaveLength(2);
	});

	it("shows grouping actions and selection count", () => {
		render(<AnnotationToolbar {...defaultProps} selectedGroupCount={2} canCreateGroup={true} />);
		expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /group selected/i })).toBeEnabled();
		expect(screen.getByRole("button", { name: /clear selection/i })).toBeEnabled();
	});

	it("disables grouping actions when nothing is selected", () => {
		render(<AnnotationToolbar {...defaultProps} />);
		expect(screen.getByRole("button", { name: /group selected/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /clear selection/i })).toBeDisabled();
	});

	it("renders dot color input with current value", () => {
		render(<AnnotationToolbar {...defaultProps} dotColor="#ff0000" />);
		const colorInputs = screen.getAllByLabelText(/color/i);
		expect(colorInputs[0]).toHaveValue("#ff0000");
	});

	it("calls onDotLabelChange when label changes", async () => {
		const onDotLabelChange = jest.fn();
		render(<AnnotationToolbar {...defaultProps} onDotLabelChange={onDotLabelChange} />);

		const labelInput = screen.getByLabelText(/dot label/i);
		await userEvent.type(labelInput, "R");

		expect(onDotLabelChange).toHaveBeenCalledWith("R");
	});

	it("calls onGroupColorChange when group color changes", async () => {
		const onGroupColorChange = jest.fn();
		render(<AnnotationToolbar {...defaultProps} onGroupColorChange={onGroupColorChange} />);

		const colorInputs = screen.getAllByLabelText(/color/i);
		fireEvent.change(colorInputs[1], { target: { value: "#ff0000" } });

		expect(onGroupColorChange).toHaveBeenCalledWith("#ff0000");
	});

	it("calls onDotColorChange when marker color changes", async () => {
		const onDotColorChange = jest.fn();
		render(<AnnotationToolbar {...defaultProps} onDotColorChange={onDotColorChange} />);

		const colorInputs = screen.getAllByLabelText(/color/i);
		fireEvent.change(colorInputs[0], { target: { value: "#ff0000" } });

		expect(onDotColorChange).toHaveBeenCalledWith("#ff0000");
	});

	it("calls onDotShapeChange when shape changes", async () => {
		const onDotShapeChange = jest.fn();
		render(<AnnotationToolbar {...defaultProps} onDotShapeChange={onDotShapeChange} />);

		const shapeSelect = screen.getByLabelText(/dot shape/i);
		await userEvent.selectOptions(shapeSelect, "square");

		expect(onDotShapeChange).toHaveBeenCalledWith("square");
	});

	it("calls onCreateGroup when grouping button is clicked", async () => {
		const onCreateGroup = jest.fn();
		render(
			<AnnotationToolbar
				{...defaultProps}
				selectedGroupCount={2}
				canCreateGroup={true}
				onCreateGroup={onCreateGroup}
			/>,
		);

		await userEvent.click(screen.getByRole("button", { name: /group selected/i }));

		expect(onCreateGroup).toHaveBeenCalled();
	});

	it("calls onClearSelection when clear button is clicked", async () => {
		const onClearSelection = jest.fn();
		render(
			<AnnotationToolbar
				{...defaultProps}
				selectedGroupCount={2}
				onClearSelection={onClearSelection}
			/>,
		);

		await userEvent.click(screen.getByRole("button", { name: /clear selection/i }));

		expect(onClearSelection).toHaveBeenCalled();
	});
});

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnnotationToolbar } from "./AnnotationToolbar";

describe("AnnotationToolbar", () => {
	const defaultProps = {
		dotColor: "#3B82F6",
		dotLabel: "",
		dotShape: "circle" as const,
		lineColor: "#4A3A2C",
		lineStyle: "solid" as const,
		connectMode: false,
		groupMode: false,
		groupColor: "#8B5CF6",
		onDotColorChange: jest.fn(),
		onDotLabelChange: jest.fn(),
		onDotShapeChange: jest.fn(),
		onLineColorChange: jest.fn(),
		onLineStyleChange: jest.fn(),
		onConnectModeChange: jest.fn(),
		onGroupModeChange: jest.fn(),
		onGroupColorChange: jest.fn(),
	};

	it("renders tool mode buttons", () => {
		render(<AnnotationToolbar {...defaultProps} />);
		expect(screen.getByRole("button", { name: /^dot$/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^line$/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^group$/i })).toBeInTheDocument();
	});

	it("shows dot tool controls when dot mode is active (default)", () => {
		render(<AnnotationToolbar {...defaultProps} />);
		expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/dot label/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/dot shape/i)).toBeInTheDocument();
	});

	it("shows line tool controls when connect mode is active", () => {
		render(<AnnotationToolbar {...defaultProps} connectMode={true} />);
		expect(screen.getByLabelText(/line style/i)).toBeInTheDocument();
		// Dot-specific controls should not be visible
		expect(screen.queryByLabelText(/dot label/i)).not.toBeInTheDocument();
		expect(screen.queryByLabelText(/dot shape/i)).not.toBeInTheDocument();
	});

	it("shows group tool controls when group mode is active", () => {
		render(<AnnotationToolbar {...defaultProps} groupMode={true} />);
		expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
		// Dot-specific controls should not be visible
		expect(screen.queryByLabelText(/dot label/i)).not.toBeInTheDocument();
	});

	it("renders dot color input with current value", () => {
		render(<AnnotationToolbar {...defaultProps} dotColor="#ff0000" />);
		const colorInput = screen.getByLabelText(/color/i);
		expect(colorInput).toHaveValue("#ff0000");
	});

	it("calls onDotLabelChange when label changes", async () => {
		const onDotLabelChange = jest.fn();
		render(<AnnotationToolbar {...defaultProps} onDotLabelChange={onDotLabelChange} />);

		const labelInput = screen.getByLabelText(/dot label/i);
		await userEvent.type(labelInput, "R");

		expect(onDotLabelChange).toHaveBeenCalledWith("R");
	});

	it("calls onLineColorChange when line color changes", async () => {
		const onLineColorChange = jest.fn();
		render(
			<AnnotationToolbar
				{...defaultProps}
				connectMode={true}
				onLineColorChange={onLineColorChange}
			/>,
		);

		const colorInput = screen.getByLabelText(/color/i);
		fireEvent.change(colorInput, { target: { value: "#ff0000" } });

		expect(onLineColorChange).toHaveBeenCalledWith("#ff0000");
	});

	it("calls onGroupColorChange when group color changes", async () => {
		const onGroupColorChange = jest.fn();
		render(
			<AnnotationToolbar
				{...defaultProps}
				groupMode={true}
				onGroupColorChange={onGroupColorChange}
			/>,
		);

		const colorInput = screen.getByLabelText(/color/i);
		fireEvent.change(colorInput, { target: { value: "#ff0000" } });

		expect(onGroupColorChange).toHaveBeenCalledWith("#ff0000");
	});

	it("calls onDotShapeChange when shape changes", async () => {
		const onDotShapeChange = jest.fn();
		render(<AnnotationToolbar {...defaultProps} onDotShapeChange={onDotShapeChange} />);

		const shapeSelect = screen.getByLabelText(/dot shape/i);
		await userEvent.selectOptions(shapeSelect, "square");

		expect(onDotShapeChange).toHaveBeenCalledWith("square");
	});

	it("calls onLineStyleChange when line style changes", async () => {
		const onLineStyleChange = jest.fn();
		render(
			<AnnotationToolbar
				{...defaultProps}
				connectMode={true}
				onLineStyleChange={onLineStyleChange}
			/>,
		);

		const lineSelect = screen.getByLabelText(/line style/i);
		await userEvent.selectOptions(lineSelect, "dashed");

		expect(onLineStyleChange).toHaveBeenCalledWith("dashed");
	});

	it("switches to line mode when Line button is clicked", async () => {
		const onConnectModeChange = jest.fn();
		const onGroupModeChange = jest.fn();
		render(
			<AnnotationToolbar
				{...defaultProps}
				onConnectModeChange={onConnectModeChange}
				onGroupModeChange={onGroupModeChange}
			/>,
		);

		await userEvent.click(screen.getByRole("button", { name: /^line$/i }));

		expect(onConnectModeChange).toHaveBeenCalledWith(true);
		expect(onGroupModeChange).toHaveBeenCalledWith(false);
	});

	it("switches to group mode when Group button is clicked", async () => {
		const onConnectModeChange = jest.fn();
		const onGroupModeChange = jest.fn();
		render(
			<AnnotationToolbar
				{...defaultProps}
				onConnectModeChange={onConnectModeChange}
				onGroupModeChange={onGroupModeChange}
			/>,
		);

		await userEvent.click(screen.getByRole("button", { name: /^group$/i }));

		expect(onConnectModeChange).toHaveBeenCalledWith(false);
		expect(onGroupModeChange).toHaveBeenCalledWith(true);
	});

	it("marks the active tool button with aria-pressed=true", () => {
		render(<AnnotationToolbar {...defaultProps} connectMode={true} />);
		const lineBtn = screen.getByRole("button", { name: /^line$/i });
		expect(lineBtn).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByRole("button", { name: /^dot$/i })).toHaveAttribute("aria-pressed", "false");
	});
});

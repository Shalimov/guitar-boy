import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnnotationToolbar } from "./AnnotationToolbar";

describe("AnnotationToolbar", () => {
	const defaultProps = {
		dotColor: "#3B82F6",
		dotShape: "circle" as const,
		lineStyle: "solid" as const,
		connectMode: false,
		onDotColorChange: jest.fn(),
		onDotShapeChange: jest.fn(),
		onLineStyleChange: jest.fn(),
		onConnectModeChange: jest.fn(),
	};

	it("renders all toolbar controls", () => {
		render(<AnnotationToolbar {...defaultProps} />);
		expect(screen.getByLabelText(/dot color/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/dot shape/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/line style/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/connect mode/i)).toBeInTheDocument();
	});

	it("renders color input with current value", () => {
		render(<AnnotationToolbar {...defaultProps} dotColor="#ff0000" />);
		const colorInput = screen.getByLabelText(/dot color/i);
		expect(colorInput).toHaveValue("#ff0000");
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
		render(<AnnotationToolbar {...defaultProps} onLineStyleChange={onLineStyleChange} />);

		const lineSelect = screen.getByLabelText(/line style/i);
		await userEvent.selectOptions(lineSelect, "dashed");

		expect(onLineStyleChange).toHaveBeenCalledWith("dashed");
	});

	it("calls onConnectModeChange when connect toggle clicked", async () => {
		const onConnectModeChange = jest.fn();
		render(<AnnotationToolbar {...defaultProps} onConnectModeChange={onConnectModeChange} />);

		const connectButton = screen.getByLabelText(/connect mode/i);
		await userEvent.click(connectButton);

		expect(onConnectModeChange).toHaveBeenCalledWith(true);
	});

	it("shows active state for connect mode", () => {
		render(<AnnotationToolbar {...defaultProps} connectMode={true} />);
		const connectButton = screen.getByLabelText(/connect mode/i);
		expect(connectButton).toHaveClass("bg-blue-600");
	});
});

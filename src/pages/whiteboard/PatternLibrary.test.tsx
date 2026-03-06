import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Diagram } from "@/types";
import { PatternLibrary } from "./PatternLibrary";

describe("PatternLibrary", () => {
	const mockPatterns: Diagram[] = [
		{
			id: "caged-c",
			name: "C Shape (CAGED)",
			createdAt: "2026-01-01T00:00:00Z",
			updatedAt: "2026-01-01T00:00:00Z",
			fretboardState: { dots: [], lines: [] },
			isBuiltIn: true,
		},
		{
			id: "pentatonic-1",
			name: "Pentatonic Box 1",
			createdAt: "2026-01-01T00:00:00Z",
			updatedAt: "2026-01-01T00:00:00Z",
			fretboardState: { dots: [], lines: [] },
			isBuiltIn: true,
		},
	];

	it("renders pattern names and category headings", () => {
		render(
			<PatternLibrary patterns={mockPatterns} onViewPattern={jest.fn()} onEditCopy={jest.fn()} />,
		);
		expect(screen.getByText("C Shape (CAGED)")).toBeInTheDocument();
		expect(screen.getByText("Pentatonic Box 1")).toBeInTheDocument();
		// Category headings derived from id prefix
		expect(screen.getByText("CAGED Shapes")).toBeInTheDocument();
		expect(screen.getByText("Minor Pentatonic")).toBeInTheDocument();
	});

	it("calls onViewPattern when View button is clicked", async () => {
		const onViewPattern = jest.fn();
		render(
			<PatternLibrary
				patterns={mockPatterns}
				onViewPattern={onViewPattern}
				onEditCopy={jest.fn()}
			/>,
		);

		const viewButtons = screen.getAllByRole("button", { name: "View" });
		await userEvent.click(viewButtons[0]);

		expect(onViewPattern).toHaveBeenCalledWith(mockPatterns[0]);
	});

	it("calls onEditCopy when Edit Copy button is clicked", async () => {
		const onEditCopy = jest.fn();
		render(
			<PatternLibrary patterns={mockPatterns} onViewPattern={jest.fn()} onEditCopy={onEditCopy} />,
		);

		const editCopyButtons = screen.getAllByRole("button", { name: "Edit Copy" });
		await userEvent.click(editCopyButtons[0]);

		expect(onEditCopy).toHaveBeenCalledWith(mockPatterns[0]);
	});
});

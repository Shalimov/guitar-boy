import { render, screen } from "@testing-library/react";
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

	it("renders pattern categories", () => {
		render(<PatternLibrary patterns={mockPatterns} onSelectPattern={jest.fn()} />);
		expect(screen.getByText("Built-in Patterns")).toBeInTheDocument();
		expect(screen.getByText("C Shape (CAGED)")).toBeInTheDocument();
		expect(screen.getByText("Pentatonic Box 1")).toBeInTheDocument();
	});

	it("calls onSelectPattern when pattern clicked", async () => {
		const onSelectPattern = jest.fn();
		render(<PatternLibrary patterns={mockPatterns} onSelectPattern={onSelectPattern} />);

		const patternButton = screen.getByText("C Shape (CAGED)");
		await userEvent.click(patternButton);

		expect(onSelectPattern).toHaveBeenCalledWith(mockPatterns[0]);
	});
});

import userEvent from "@testing-library/user-event";

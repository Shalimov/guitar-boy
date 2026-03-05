import type { Diagram } from "@/types";

export const cagedShapes: Diagram[] = [
	{
		id: "caged-c",
		name: "C Shape (CAGED)",
		description: "C major shape based on open C chord",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 1, fret: 3 }, label: "R", color: "#3B82F6" },
				{ position: { string: 2, fret: 2 }, label: "3", color: "#10B981" },
				{ position: { string: 3, fret: 0 }, label: "5", color: "#F59E0B" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "caged-a",
		name: "A Shape (CAGED)",
		description: "A major shape based on open A chord",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 0, fret: 5 }, label: "R", color: "#3B82F6" },
				{ position: { string: 1, fret: 4 }, label: "3", color: "#10B981" },
				{ position: { string: 2, fret: 2 }, label: "5", color: "#F59E0B" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
];

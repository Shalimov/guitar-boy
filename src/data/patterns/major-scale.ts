import type { Diagram } from "@/types";

export const majorScalePatterns: Diagram[] = [
	{
		id: "major-scale-1",
		name: "Major Scale Position 1",
		description: "First position (3-notes-per-string)",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 0, fret: 5 }, label: "1", color: "#3B82F6" },
				{ position: { string: 0, fret: 7 }, label: "2", color: "#10B981" },
				{ position: { string: 0, fret: 9 }, label: "3", color: "#F59E0B" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
];

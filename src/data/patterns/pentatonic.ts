import type { Diagram } from "@/types";

export const pentatonicPatterns: Diagram[] = [
	{
		id: "pentatonic-1",
		name: "Pentatonic Position 1",
		description: "First position of minor pentatonic scale",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 0, fret: 5 }, label: "1", color: "#3B82F6" },
				{ position: { string: 0, fret: 8 }, label: "2", color: "#10B981" },
				{ position: { string: 1, fret: 5 }, label: "3", color: "#F59E0B" },
				{ position: { string: 1, fret: 7 }, label: "4", color: "#8B5CF6" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
];

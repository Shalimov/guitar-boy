import type { Diagram } from "@/types";

export const intervalPatterns: Diagram[] = [
	{
		id: "interval-m3",
		name: "Minor 3rd Interval",
		description: "Shape for minor 3rd (3 frets)",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 0, fret: 5 }, label: "R", color: "#3B82F6" },
				{ position: { string: 0, fret: 8 }, label: "m3", color: "#10B981" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-p5",
		name: "Perfect 5th Interval",
		description: "Shape for perfect 5th (7 frets)",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 0, fret: 5 }, label: "R", color: "#3B82F6" },
				{ position: { string: 0, fret: 12 }, label: "P5", color: "#F59E0B" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
];

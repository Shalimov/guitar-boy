import type { Diagram } from "@/types";

// CAGED system: 5 major chord shapes
// String index: 0=low E, 1=A, 2=D, 3=G, 4=B, 5=high e
// All shapes shown rooted on A (root note = A)

export const cagedShapes: Diagram[] = [
	{
		id: "caged-c",
		name: "C Shape (CAGED)",
		description: "C major shape — root on string 1 (A string). Shown here rooted at A, fret 12.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// C shape rooted at A (fret 12, string 1)
				// low E string: muted (not included)
				{ position: { string: 1, fret: 12 }, label: "R", color: "#b35d2a" }, // A  — root
				{ position: { string: 2, fret: 11 }, label: "5", color: "#e8b48d" }, // E  — 5th
				{ position: { string: 3, fret: 9 }, label: "R", color: "#b35d2a" }, // A  — root
				{ position: { string: 4, fret: 10 }, label: "3", color: "#8f451d" }, // C# — 3rd
				{ position: { string: 5, fret: 12 }, label: "R", color: "#b35d2a" }, // A  — root
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "caged-a",
		name: "A Shape (CAGED)",
		description:
			"A major shape — root on string 1 (A string). Shown here rooted at A, fret 0 (open).",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// Open A chord: x02220
				{ position: { string: 1, fret: 0 }, label: "R", color: "#b35d2a" }, // A  — root (open)
				{ position: { string: 2, fret: 2 }, label: "5", color: "#e8b48d" }, // E  — 5th
				{ position: { string: 3, fret: 2 }, label: "R", color: "#b35d2a" }, // A  — root
				{ position: { string: 4, fret: 2 }, label: "3", color: "#8f451d" }, // C# — 3rd
				{ position: { string: 5, fret: 0 }, label: "5", color: "#e8b48d" }, // E  — 5th (open)
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "caged-g",
		name: "G Shape (CAGED)",
		description: "G major shape — root on strings 0 and 5. Shown here rooted at A, fret 5.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// G shape rooted at A (fret 5, strings 0 & 5)
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A  — root
				{ position: { string: 1, fret: 7 }, label: "5", color: "#e8b48d" }, // E  — 5th
				{ position: { string: 2, fret: 7 }, label: "R", color: "#b35d2a" }, // A  — root
				{ position: { string: 3, fret: 6 }, label: "3", color: "#8f451d" }, // C# — 3rd
				{ position: { string: 4, fret: 5 }, label: "5", color: "#e8b48d" }, // E  — 5th
				{ position: { string: 5, fret: 5 }, label: "R", color: "#b35d2a" }, // A  — root
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "caged-e",
		name: "E Shape (CAGED)",
		description: "E major shape — root on string 0 (low E string). Shown here rooted at A, fret 5.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// E shape rooted at A (fret 5, string 0)
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A  — root
				{ position: { string: 1, fret: 7 }, label: "5", color: "#e8b48d" }, // E  — 5th
				{ position: { string: 2, fret: 7 }, label: "R", color: "#b35d2a" }, // A  — root
				{ position: { string: 3, fret: 6 }, label: "3", color: "#8f451d" }, // C# — 3rd
				{ position: { string: 4, fret: 5 }, label: "R", color: "#b35d2a" }, // A  — root
				{ position: { string: 5, fret: 5 }, label: "R", color: "#b35d2a" }, // A  — root
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "caged-d",
		name: "D Shape (CAGED)",
		description: "D major shape — root on string 2 (D string). Shown here rooted at A, fret 12.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// D shape rooted at A (fret 12, string 2)
				// low E and A strings not used
				{ position: { string: 2, fret: 12 }, label: "R", color: "#b35d2a" }, // A  — root
				{ position: { string: 3, fret: 11 }, label: "3", color: "#8f451d" }, // C# — 3rd
				{ position: { string: 4, fret: 12 }, label: "5", color: "#e8b48d" }, // E  — 5th
				{ position: { string: 5, fret: 10 }, label: "R", color: "#b35d2a" }, // A  — root
			],
			lines: [],
		},
		isBuiltIn: true,
	},
];

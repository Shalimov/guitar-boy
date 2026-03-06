import type { Diagram } from "@/types";

// A major scale — 3-notes-per-string positions
// Notes: A B C# D E F# G#
// String index: 0=low E, 1=A, 2=D, 3=G, 4=B, 5=high e
// Tuning: E2 A2 D3 G3 B3 E4

export const majorScalePatterns: Diagram[] = [
	{
		id: "major-scale-1",
		name: "A Major — Position 1",
		description: "3-notes-per-string pattern starting on low E string, fret 4.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): G#(4) A(5) B(7)
				{ position: { string: 0, fret: 4 }, label: "7", color: "#e8b48d" },
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" },
				{ position: { string: 0, fret: 7 }, label: "2", color: "#e8b48d" },
				// String 1 (A): C#(4) D(5) E(7)
				{ position: { string: 1, fret: 4 }, label: "3", color: "#8f451d" },
				{ position: { string: 1, fret: 5 }, label: "4", color: "#e8b48d" },
				{ position: { string: 1, fret: 7 }, label: "5", color: "#e8b48d" },
				// String 2 (D): F#(4) G#(6) A(7)
				{ position: { string: 2, fret: 4 }, label: "6", color: "#e8b48d" },
				{ position: { string: 2, fret: 6 }, label: "7", color: "#e8b48d" },
				{ position: { string: 2, fret: 7 }, label: "R", color: "#b35d2a" },
				// String 3 (G): B(4) C#(6) D(7)
				{ position: { string: 3, fret: 4 }, label: "2", color: "#e8b48d" },
				{ position: { string: 3, fret: 6 }, label: "3", color: "#8f451d" },
				{ position: { string: 3, fret: 7 }, label: "4", color: "#e8b48d" },
				// String 4 (B): E(5) F#(7) G#(9)
				{ position: { string: 4, fret: 5 }, label: "5", color: "#e8b48d" },
				{ position: { string: 4, fret: 7 }, label: "6", color: "#e8b48d" },
				{ position: { string: 4, fret: 9 }, label: "7", color: "#e8b48d" },
				// String 5 (high e): A(5) B(7) C#(9)
				{ position: { string: 5, fret: 5 }, label: "R", color: "#b35d2a" },
				{ position: { string: 5, fret: 7 }, label: "2", color: "#e8b48d" },
				{ position: { string: 5, fret: 9 }, label: "3", color: "#8f451d" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "major-scale-2",
		name: "A Major — Position 2",
		description: "3-notes-per-string pattern, position 2 starting at fret 7 on low E.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): B(7) C#(9) D(10)
				{ position: { string: 0, fret: 7 }, label: "2", color: "#e8b48d" },
				{ position: { string: 0, fret: 9 }, label: "3", color: "#8f451d" },
				{ position: { string: 0, fret: 10 }, label: "4", color: "#e8b48d" },
				// String 1 (A): E(7) F#(9) G#(11)
				{ position: { string: 1, fret: 7 }, label: "5", color: "#e8b48d" },
				{ position: { string: 1, fret: 9 }, label: "6", color: "#e8b48d" },
				{ position: { string: 1, fret: 11 }, label: "7", color: "#e8b48d" },
				// String 2 (D): A(7) B(9) C#(11)
				{ position: { string: 2, fret: 7 }, label: "R", color: "#b35d2a" },
				{ position: { string: 2, fret: 9 }, label: "2", color: "#e8b48d" },
				{ position: { string: 2, fret: 11 }, label: "3", color: "#8f451d" },
				// String 3 (G): D(7) E(9) F#(11)
				{ position: { string: 3, fret: 7 }, label: "4", color: "#e8b48d" },
				{ position: { string: 3, fret: 9 }, label: "5", color: "#e8b48d" },
				{ position: { string: 3, fret: 11 }, label: "6", color: "#e8b48d" },
				// String 4 (B): G#(9) A(10) B(12)
				{ position: { string: 4, fret: 9 }, label: "7", color: "#e8b48d" },
				{ position: { string: 4, fret: 10 }, label: "R", color: "#b35d2a" },
				{ position: { string: 4, fret: 12 }, label: "2", color: "#e8b48d" },
				// String 5 (high e): C#(9) D(10) E(12)
				{ position: { string: 5, fret: 9 }, label: "3", color: "#8f451d" },
				{ position: { string: 5, fret: 10 }, label: "4", color: "#e8b48d" },
				{ position: { string: 5, fret: 12 }, label: "5", color: "#e8b48d" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
];

import type { Diagram } from "@/types";

// A natural minor scale (Aeolian mode) — 3-notes-per-string positions
// Notes: A B C D E F G
// String index: 0=low E, 1=A, 2=D, 3=G, 4=B, 5=high e
// Tuning: E2 A2 D3 G3 B3 E4

export const minorScalePatterns: Diagram[] = [
	{
		id: "minor-scale-1",
		name: "A Natural Minor — Position 1",
		description: "3-notes-per-string pattern starting on low E string, fret 5.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): A(5) B(7) C(8)
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" },
				{ position: { string: 0, fret: 7 }, label: "2", color: "#e8b48d" },
				{ position: { string: 0, fret: 8 }, label: "b3", color: "#e8b48d" },
				// String 1 (A): D(5) E(7) F(8)
				{ position: { string: 1, fret: 5 }, label: "4", color: "#e8b48d" },
				{ position: { string: 1, fret: 7 }, label: "5", color: "#e8b48d" },
				{ position: { string: 1, fret: 8 }, label: "b6", color: "#e8b48d" },
				// String 2 (D): G(5) A(7) B(9)
				{ position: { string: 2, fret: 5 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 2, fret: 7 }, label: "R", color: "#b35d2a" },
				{ position: { string: 2, fret: 9 }, label: "2", color: "#e8b48d" },
				// String 3 (G): C(5) D(7) E(9)
				{ position: { string: 3, fret: 5 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 3, fret: 7 }, label: "4", color: "#e8b48d" },
				{ position: { string: 3, fret: 9 }, label: "5", color: "#e8b48d" },
				// String 4 (B): F(6) G(8) A(10)
				{ position: { string: 4, fret: 6 }, label: "b6", color: "#e8b48d" },
				{ position: { string: 4, fret: 8 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 4, fret: 10 }, label: "R", color: "#b35d2a" },
				// String 5 (high e): B(7) C(8) D(10)
				{ position: { string: 5, fret: 7 }, label: "2", color: "#e8b48d" },
				{ position: { string: 5, fret: 8 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 5, fret: 10 }, label: "4", color: "#e8b48d" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "minor-scale-2",
		name: "A Natural Minor — Position 2",
		description: "3-notes-per-string pattern, position 2 starting at fret 7 on low E.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): B(7) C(8) D(10)
				{ position: { string: 0, fret: 7 }, label: "2", color: "#e8b48d" },
				{ position: { string: 0, fret: 8 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 0, fret: 10 }, label: "4", color: "#e8b48d" },
				// String 1 (A): E(7) F(8) G(10)
				{ position: { string: 1, fret: 7 }, label: "5", color: "#e8b48d" },
				{ position: { string: 1, fret: 8 }, label: "b6", color: "#e8b48d" },
				{ position: { string: 1, fret: 10 }, label: "b7", color: "#e8b48d" },
				// String 2 (D): A(7) B(9) C(10)
				{ position: { string: 2, fret: 7 }, label: "R", color: "#b35d2a" },
				{ position: { string: 2, fret: 9 }, label: "2", color: "#e8b48d" },
				{ position: { string: 2, fret: 10 }, label: "b3", color: "#e8b48d" },
				// String 3 (G): D(7) E(9) F(10)
				{ position: { string: 3, fret: 7 }, label: "4", color: "#e8b48d" },
				{ position: { string: 3, fret: 9 }, label: "5", color: "#e8b48d" },
				{ position: { string: 3, fret: 10 }, label: "b6", color: "#e8b48d" },
				// String 4 (B): G(8) A(10) B(12)
				{ position: { string: 4, fret: 8 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 4, fret: 10 }, label: "R", color: "#b35d2a" },
				{ position: { string: 4, fret: 12 }, label: "2", color: "#e8b48d" },
				// String 5 (high e): C(8) D(10) E(12)
				{ position: { string: 5, fret: 8 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 5, fret: 10 }, label: "4", color: "#e8b48d" },
				{ position: { string: 5, fret: 12 }, label: "5", color: "#e8b48d" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "minor-scale-3",
		name: "A Natural Minor — Position 3",
		description: "3-notes-per-string pattern, position 3 starting at fret 8 on low E.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): C(8) D(10) E(12)
				{ position: { string: 0, fret: 8 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 0, fret: 10 }, label: "4", color: "#e8b48d" },
				{ position: { string: 0, fret: 12 }, label: "5", color: "#e8b48d" },
				// String 1 (A): F(8) G(10) A(12)
				{ position: { string: 1, fret: 8 }, label: "b6", color: "#e8b48d" },
				{ position: { string: 1, fret: 10 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 1, fret: 12 }, label: "R", color: "#b35d2a" },
				// String 2 (D): B(9) C(10) D(12)
				{ position: { string: 2, fret: 9 }, label: "2", color: "#e8b48d" },
				{ position: { string: 2, fret: 10 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 2, fret: 12 }, label: "4", color: "#e8b48d" },
				// String 3 (G): E(9) F(10) G(12)
				{ position: { string: 3, fret: 9 }, label: "5", color: "#e8b48d" },
				{ position: { string: 3, fret: 10 }, label: "b6", color: "#e8b48d" },
				{ position: { string: 3, fret: 12 }, label: "b7", color: "#e8b48d" },
				// String 4 (B): A(10) B(12) C(13)
				{ position: { string: 4, fret: 10 }, label: "R", color: "#b35d2a" },
				{ position: { string: 4, fret: 12 }, label: "2", color: "#e8b48d" },
				{ position: { string: 4, fret: 13 }, label: "b3", color: "#e8b48d" },
				// String 5 (high e): D(10) E(12) F(13)
				{ position: { string: 5, fret: 10 }, label: "4", color: "#e8b48d" },
				{ position: { string: 5, fret: 12 }, label: "5", color: "#e8b48d" },
				{ position: { string: 5, fret: 13 }, label: "b6", color: "#e8b48d" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
];

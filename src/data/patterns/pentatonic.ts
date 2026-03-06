import type { Diagram } from "@/types";

// A minor pentatonic scale — all 5 positions
// Notes: A C D E G
// String index: 0=low E, 1=A, 2=D, 3=G, 4=B, 5=high e
// Tuning: E2 A2 D3 G3 B3 E4
// R = root (A), colored accent; other scale degrees in soft accent

export const pentatonicPatterns: Diagram[] = [
	{
		id: "pentatonic-1",
		name: "Am Pentatonic — Position 1",
		description: "Position 1 (box shape) starting at fret 5. Most common starting position.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): A(5) C(8)
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" },
				{ position: { string: 0, fret: 8 }, label: "b3", color: "#e8b48d" },
				// String 1 (A): D(5) E(7)
				{ position: { string: 1, fret: 5 }, label: "4", color: "#e8b48d" },
				{ position: { string: 1, fret: 7 }, label: "5", color: "#e8b48d" },
				// String 2 (D): G(5) A(7)
				{ position: { string: 2, fret: 5 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 2, fret: 7 }, label: "R", color: "#b35d2a" },
				// String 3 (G): C(5) D(7)
				{ position: { string: 3, fret: 5 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 3, fret: 7 }, label: "4", color: "#e8b48d" },
				// String 4 (B): E(5) G(8)
				{ position: { string: 4, fret: 5 }, label: "5", color: "#e8b48d" },
				{ position: { string: 4, fret: 8 }, label: "b7", color: "#e8b48d" },
				// String 5 (high e): A(5) C(8)
				{ position: { string: 5, fret: 5 }, label: "R", color: "#b35d2a" },
				{ position: { string: 5, fret: 8 }, label: "b3", color: "#e8b48d" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "pentatonic-2",
		name: "Am Pentatonic — Position 2",
		description: "Position 2 starting at fret 7.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): C(8) D(10)
				{ position: { string: 0, fret: 8 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 0, fret: 10 }, label: "4", color: "#e8b48d" },
				// String 1 (A): E(7) G(10)
				{ position: { string: 1, fret: 7 }, label: "5", color: "#e8b48d" },
				{ position: { string: 1, fret: 10 }, label: "b7", color: "#e8b48d" },
				// String 2 (D): A(7) C(10)
				{ position: { string: 2, fret: 7 }, label: "R", color: "#b35d2a" },
				{ position: { string: 2, fret: 10 }, label: "b3", color: "#e8b48d" },
				// String 3 (G): D(7) E(9)
				{ position: { string: 3, fret: 7 }, label: "4", color: "#e8b48d" },
				{ position: { string: 3, fret: 9 }, label: "5", color: "#e8b48d" },
				// String 4 (B): G(8) A(10)
				{ position: { string: 4, fret: 8 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 4, fret: 10 }, label: "R", color: "#b35d2a" },
				// String 5 (high e): C(8) D(10)
				{ position: { string: 5, fret: 8 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 5, fret: 10 }, label: "4", color: "#e8b48d" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "pentatonic-3",
		name: "Am Pentatonic — Position 3",
		description: "Position 3 starting at fret 10.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): D(10) E(12)
				{ position: { string: 0, fret: 10 }, label: "4", color: "#e8b48d" },
				{ position: { string: 0, fret: 12 }, label: "5", color: "#e8b48d" },
				// String 1 (A): G(10) A(12)
				{ position: { string: 1, fret: 10 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 1, fret: 12 }, label: "R", color: "#b35d2a" },
				// String 2 (D): C(10) D(12)
				{ position: { string: 2, fret: 10 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 2, fret: 12 }, label: "4", color: "#e8b48d" },
				// String 3 (G): E(9) G(12)
				{ position: { string: 3, fret: 9 }, label: "5", color: "#e8b48d" },
				{ position: { string: 3, fret: 12 }, label: "b7", color: "#e8b48d" },
				// String 4 (B): A(10) C(13)
				{ position: { string: 4, fret: 10 }, label: "R", color: "#b35d2a" },
				{ position: { string: 4, fret: 13 }, label: "b3", color: "#e8b48d" },
				// String 5 (high e): D(10) E(12)
				{ position: { string: 5, fret: 10 }, label: "4", color: "#e8b48d" },
				{ position: { string: 5, fret: 12 }, label: "5", color: "#e8b48d" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "pentatonic-4",
		name: "Am Pentatonic — Position 4",
		description: "Position 4 starting at fret 12.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): E(12) G(15)
				{ position: { string: 0, fret: 12 }, label: "5", color: "#e8b48d" },
				{ position: { string: 0, fret: 15 }, label: "b7", color: "#e8b48d" },
				// String 1 (A): A(12) C(15)
				{ position: { string: 1, fret: 12 }, label: "R", color: "#b35d2a" },
				{ position: { string: 1, fret: 15 }, label: "b3", color: "#e8b48d" },
				// String 2 (D): D(12) E(14)
				{ position: { string: 2, fret: 12 }, label: "4", color: "#e8b48d" },
				{ position: { string: 2, fret: 14 }, label: "5", color: "#e8b48d" },
				// String 3 (G): G(12) A(14)
				{ position: { string: 3, fret: 12 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 3, fret: 14 }, label: "R", color: "#b35d2a" },
				// String 4 (B): C(13) D(15)
				{ position: { string: 4, fret: 13 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 4, fret: 15 }, label: "4", color: "#e8b48d" },
				// String 5 (high e): E(12) G(15)
				{ position: { string: 5, fret: 12 }, label: "5", color: "#e8b48d" },
				{ position: { string: 5, fret: 15 }, label: "b7", color: "#e8b48d" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "pentatonic-5",
		name: "Am Pentatonic — Position 5",
		description: "Position 5 starting at fret 15 (connects back to position 1 at fret 17).",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// String 0 (low E): G(15) A(17)
				{ position: { string: 0, fret: 15 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 0, fret: 17 }, label: "R", color: "#b35d2a" },
				// String 1 (A): C(15) D(17)
				{ position: { string: 1, fret: 15 }, label: "b3", color: "#e8b48d" },
				{ position: { string: 1, fret: 17 }, label: "4", color: "#e8b48d" },
				// String 2 (D): E(14) G(17)
				{ position: { string: 2, fret: 14 }, label: "5", color: "#e8b48d" },
				{ position: { string: 2, fret: 17 }, label: "b7", color: "#e8b48d" },
				// String 3 (G): A(14) C(17)
				{ position: { string: 3, fret: 14 }, label: "R", color: "#b35d2a" },
				{ position: { string: 3, fret: 17 }, label: "b3", color: "#e8b48d" },
				// String 4 (B): D(15) E(17)
				{ position: { string: 4, fret: 15 }, label: "4", color: "#e8b48d" },
				{ position: { string: 4, fret: 17 }, label: "5", color: "#e8b48d" },
				// String 5 (high e): G(15) A(17)
				{ position: { string: 5, fret: 15 }, label: "b7", color: "#e8b48d" },
				{ position: { string: 5, fret: 17 }, label: "R", color: "#b35d2a" },
			],
			lines: [],
		},
		isBuiltIn: true,
	},
];

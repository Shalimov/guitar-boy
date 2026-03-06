import type { Diagram } from "@/types";

// Common guitar interval shapes
// String index: 0=low E, 1=A, 2=D, 3=G, 4=B, 5=high e
// Each pattern shows the interval shape on adjacent strings
// Root shown on string 0 at fret 5 (note A) where applicable

export const intervalPatterns: Diagram[] = [
	{
		id: "interval-unison",
		name: "Unison (same string)",
		description: "Same note on the same string — 0 frets apart.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 1, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 1, fret: 5 }, label: "1", color: "#b35d2a" }, // A (same)
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-m2",
		name: "Minor 2nd",
		description: "1 fret apart on the same string, or a specific cross-string shape.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 0, fret: 6 }, label: "m2", color: "#e8b48d" }, // A#/Bb
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-M2",
		name: "Major 2nd",
		description: "2 frets apart on the same string.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 0, fret: 7 }, label: "M2", color: "#e8b48d" }, // B
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-m3",
		name: "Minor 3rd",
		description: "3 frets apart on the same string, or 2 strings up 2 frets back (E–G strings).",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// Same string
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 0, fret: 8 }, label: "m3", color: "#e8b48d" }, // C
				// Cross string (A→D strings): 2 frets higher on next string
				{ position: { string: 1, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 2, fret: 3 }, label: "m3", color: "#e8b48d" }, // C
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-M3",
		name: "Major 3rd",
		description: "4 frets apart on the same string, or 1 string up 1 fret back (E–B: same fret).",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// Same string
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 0, fret: 9 }, label: "M3", color: "#8f451d" }, // C#
				// Cross string (A→D strings): 1 fret back on next string
				{ position: { string: 1, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 2, fret: 4 }, label: "M3", color: "#8f451d" }, // C#
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-p4",
		name: "Perfect 4th",
		description:
			"5 frets on same string, or 1 string up at the same fret (except G→B: 1 fret higher).",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// Same string
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 0, fret: 10 }, label: "P4", color: "#e8b48d" }, // D
				// Cross string (A→D): same fret
				{ position: { string: 1, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 2, fret: 5 }, label: "P4", color: "#e8b48d" }, // D
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-tritone",
		name: "Tritone (Diminished 5th)",
		description: "6 frets apart on the same string — the devil's interval.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 0, fret: 11 }, label: "TT", color: "#e8b48d" }, // D#/Eb
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-p5",
		name: "Perfect 5th",
		description: "7 frets on same string, or 1 string up 2 frets higher (except G→B: 3 frets).",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// Same string
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 0, fret: 12 }, label: "P5", color: "#e8b48d" }, // E
				// Cross string (A→D): 2 frets up
				{ position: { string: 1, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 2, fret: 7 }, label: "P5", color: "#e8b48d" }, // E
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-m6",
		name: "Minor 6th",
		description: "8 frets on same string.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 1, fret: 8 }, label: "m6", color: "#e8b48d" }, // F (on A string)
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-M6",
		name: "Major 6th",
		description: "9 frets on same string, or 1 string up 3 frets higher on adjacent string.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// Cross string (A→D): 3 frets up
				{ position: { string: 1, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 2, fret: 9 }, label: "M6", color: "#e8b48d" }, // F#
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-m7",
		name: "Minor 7th",
		description: "10 frets on same string, or 2 strings up same fret.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// Cross string (low E→D): same fret
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 2, fret: 5 }, label: "m7", color: "#e8b48d" }, // G
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-M7",
		name: "Major 7th",
		description: "11 frets on same string, or 2 strings up 1 fret higher.",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// Cross string (low E→D): 1 fret up
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 2, fret: 6 }, label: "M7", color: "#e8b48d" }, // G#
			],
			lines: [],
		},
		isBuiltIn: true,
	},
	{
		id: "interval-octave",
		name: "Octave",
		description: "12 frets on same string, or 2 strings up 2 frets higher (3 frets on G→B).",
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: "2026-01-01T00:00:00Z",
		fretboardState: {
			dots: [
				// Same string
				{ position: { string: 0, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 0, fret: 17 }, label: "8ve", color: "#b35d2a" }, // A (octave)
				// Cross string (low E→D): 2 frets up
				{ position: { string: 1, fret: 5 }, label: "R", color: "#b35d2a" }, // A
				{ position: { string: 3, fret: 7 }, label: "8ve", color: "#b35d2a" }, // A (octave)
			],
			lines: [],
		},
		isBuiltIn: true,
	},
];

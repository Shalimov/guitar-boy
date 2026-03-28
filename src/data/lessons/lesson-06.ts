import type { Lesson } from "@/types/lesson";

// G major chord = G (root), B (major 3rd, +4 semitones), D (perfect 5th, +7 semitones)
// Cleanest in-range positions for verify steps:
//   G: string 3 fret 0 (open G string)
//   B: string 4 fret 0 (open B string)
//   D: string 2 fret 0 (open D string)
// All three are open strings — easy to remember and hear.
//
// C major chord = C (root), E (major 3rd), G (perfect 5th)
// C: string 1 fret 3,  string 3 fret 5,  string 4 fret 1
// E: string 0 fret 0,  string 2 fret 2,  string 5 fret 0
// G: string 0 fret 3,  string 2 fret 5,  string 3 fret 0,  string 5 fret 3

const lesson: Lesson = {
	id: "lesson-06-major-chords",
	title: "Building Major Chords",
	description: "Learn the 1–3–5 formula and use it to find major chord tones on any string.",
	category: "chords",
	difficulty: "beginner",
	steps: [
		{
			type: "explain",
			title: "What Makes a Chord Major?",
			content:
				"A chord is three or more notes played together. The major chord — the happiest, most resolved sound — is built from three specific intervals above a root note:\n\n• Root (1): the note the chord is named after\n• Major 3rd (3): 4 semitones (4 frets on one string) above the root\n• Perfect 5th (5): 7 semitones above the root\n\nThis 1–3–5 formula works for any root note. The note you start from determines the key; the formula gives you the chord.",
			fretboardState: {
				dots: [{ position: { string: 3, fret: 0 }, label: "1", color: "#10B981" }],
				lines: [],
				highlightStrings: [3],
			},
		},
		{
			type: "explain",
			title: "G Major: G + B + D",
			content:
				"Let's build G major using the formula:\n\n• Root (G): open G string — string 3, fret 0\n• Major 3rd (B): 4 semitones above G = B — open B string (string 4, fret 0)\n• Perfect 5th (D): 7 semitones above G = D — open D string (string 2, fret 0)\n\nAll three chord tones happen to be open strings! Click each one to hear the individual notes, then try playing all three together.",
			fretboardState: {
				dots: [
					{ position: { string: 2, fret: 0 }, label: "D", color: "#6366F1" },
					{ position: { string: 3, fret: 0 }, label: "G", color: "#10B981" },
					{ position: { string: 4, fret: 0 }, label: "B", color: "#F59E0B" },
				],
				lines: [],
				highlightStrings: [2, 3, 4],
			},
		},
		{
			type: "explain",
			title: "Chord Tones Repeat Across the Fretboard",
			content:
				"The notes G, B, and D don't only exist on those open strings — they repeat all over the fretboard. A real guitar chord voicing finds these notes on nearby strings so your hand can play them all at once.\n\nHere are all the G, B, and D positions in first position. Notice the pattern: each color (green=G, yellow=B, purple=D) forms a diagonal shape that repeats.\n\nClick through each color group and hear how they all belong to the same G major family.",
			fretboardState: {
				dots: [
					// G notes
					{ position: { string: 0, fret: 3 }, label: "G", color: "#10B981" },
					{ position: { string: 2, fret: 5 }, label: "G", color: "#10B981" },
					{ position: { string: 3, fret: 0 }, label: "G", color: "#10B981" },
					{ position: { string: 5, fret: 3 }, label: "G", color: "#10B981" },
					// B notes
					{ position: { string: 1, fret: 2 }, label: "B", color: "#F59E0B" },
					{ position: { string: 3, fret: 4 }, label: "B", color: "#F59E0B" },
					{ position: { string: 4, fret: 0 }, label: "B", color: "#F59E0B" },
					// D notes
					{ position: { string: 1, fret: 5 }, label: "D", color: "#6366F1" },
					{ position: { string: 2, fret: 0 }, label: "D", color: "#6366F1" },
					{ position: { string: 4, fret: 3 }, label: "D", color: "#6366F1" },
				],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction:
				"Click the three open strings that form a G major chord: the D, G, and B strings.",
			targetPositions: [
				{ string: 2, fret: 0 },
				{ string: 3, fret: 0 },
				{ string: 4, fret: 0 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "verify",
			instruction: "Click all four G notes (the root of G major) visible in first position.",
			targetPositions: [
				{ string: 0, fret: 3 },
				{ string: 2, fret: 5 },
				{ string: 3, fret: 0 },
				{ string: 5, fret: 3 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "explain",
			title: "C Major: C + E + G",
			content:
				"Now apply the same formula to a different root — C:\n\n• Root (C): A string fret 3, B string fret 1, or G string fret 5\n• Major 3rd (E): 4 semitones above C = E — low E string open, D string fret 2, high e string open\n• Perfect 5th (G): 7 semitones above C = G — same G notes as before!\n\nThe 5th of C major is the same note as the root of G major. This overlap is why chords in the same key share notes and sound so natural together.\n\nClick through the blue (C), green (E), and orange (G) notes.",
			fretboardState: {
				dots: [
					// C notes (root)
					{ position: { string: 1, fret: 3 }, label: "C", color: "#3B82F6" },
					{ position: { string: 3, fret: 5 }, label: "C", color: "#3B82F6" },
					{ position: { string: 4, fret: 1 }, label: "C", color: "#3B82F6" },
					// E notes (major 3rd)
					{ position: { string: 0, fret: 0 }, label: "E", color: "#10B981" },
					{ position: { string: 2, fret: 2 }, label: "E", color: "#10B981" },
					{ position: { string: 5, fret: 0 }, label: "E", color: "#10B981" },
					// G notes (perfect 5th)
					{ position: { string: 0, fret: 3 }, label: "G", color: "#F59E0B" },
					{ position: { string: 2, fret: 5 }, label: "G", color: "#F59E0B" },
					{ position: { string: 3, fret: 0 }, label: "G", color: "#F59E0B" },
					{ position: { string: 5, fret: 3 }, label: "G", color: "#F59E0B" },
				],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click all three C notes (the root of C major) in first position.",
			targetPositions: [
				{ string: 1, fret: 3 },
				{ string: 3, fret: 5 },
				{ string: 4, fret: 1 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "verify",
			instruction:
				"Click the C, E, and G chord tones on strings 4, 5, and 3 (from low to high: A, D, G strings) to outline a C major chord position.",
			targetPositions: [
				{ string: 1, fret: 3 },
				{ string: 2, fret: 2 },
				{ string: 2, fret: 5 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "teach-back",
			instruction:
				"Label the G major chord tones on strings 3, 4, and 5 (G, B, D strings). Click each open string position and label it.",
			expectedLabels: [
				{ position: { string: 2, fret: 0 }, label: "D" },
				{ position: { string: 3, fret: 0 }, label: "G" },
				{ position: { string: 4, fret: 0 }, label: "B" },
			],
		},
	],
};

export default lesson;

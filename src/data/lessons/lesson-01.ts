import type { Lesson } from "@/types/lesson";

const lesson: Lesson = {
	id: "lesson-01-open-strings",
	title: "The Open Strings",
	description: "Learn the names of the six open strings on the guitar",
	category: "notes",
	difficulty: "beginner",
	steps: [
		{
			type: "explain",
			title: "Introduction to Open Strings",
			content:
				"The guitar has six strings that run horizontally across the fretboard. Each string produces a specific note when played open (without pressing any frets). In standard tuning, the strings are named from lowest (thickest) to highest (thinnest): E, A, D, G, B, E.",
		},
		{
			type: "explain",
			title: "String Names",
			content:
				"Let's learn each string name:\n\n• 6th string (lowest, thickest): E\n• 5th string: A\n• 4th string: D\n• 3rd string: G\n• 2nd string: B\n• 1st string (highest, thinnest): E\n\nNotice that the 1st and 6th strings are both E, but they're two octaves apart.",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 0 }, label: "E", color: "#3B82F6" },
					{ position: { string: 1, fret: 0 }, label: "A", color: "#3B82F6" },
					{ position: { string: 2, fret: 0 }, label: "D", color: "#3B82F6" },
					{ position: { string: 3, fret: 0 }, label: "G", color: "#3B82F6" },
					{ position: { string: 4, fret: 0 }, label: "B", color: "#3B82F6" },
					{ position: { string: 5, fret: 0 }, label: "e", color: "#3B82F6" },
				],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click on the open position (fret 0) of the 6th string (low E)",
			targetPositions: [{ string: 0, fret: 0 }],
			fretboardState: {
				dots: [],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click on the open position of the 5th string (A)",
			targetPositions: [{ string: 1, fret: 0 }],
			fretboardState: {
				dots: [],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click on the open position of the 4th string (D)",
			targetPositions: [{ string: 2, fret: 0 }],
			fretboardState: {
				dots: [],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click on the open position of the 3rd string (G)",
			targetPositions: [{ string: 3, fret: 0 }],
			fretboardState: {
				dots: [],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click on the open position of the 2nd string (B)",
			targetPositions: [{ string: 4, fret: 0 }],
			fretboardState: {
				dots: [],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click on the open position of the 1st string (high e)",
			targetPositions: [{ string: 5, fret: 0 }],
			fretboardState: {
				dots: [],
				lines: [],
			},
		},
		{
			type: "explain",
			title: "Great Job!",
			content:
				"You've learned all six open string names! Remember:\n\n• Low E (6th string) - lowest, thickest\n• A (5th string)\n• D (4th string)\n• G (3rd string)\n• B (2nd string)\n• High e (1st string) - highest, thinnest\n\nPractice identifying these strings until you can name them instantly. This is foundational knowledge for reading tabs, chord charts, and communicating with other musicians.",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 0 }, label: "E", color: "#10B981" },
					{ position: { string: 1, fret: 0 }, label: "A", color: "#10B981" },
					{ position: { string: 2, fret: 0 }, label: "D", color: "#10B981" },
					{ position: { string: 3, fret: 0 }, label: "G", color: "#10B981" },
					{ position: { string: 4, fret: 0 }, label: "B", color: "#10B981" },
					{ position: { string: 5, fret: 0 }, label: "e", color: "#10B981" },
				],
				lines: [],
			},
		},
		{
			type: "teach-back",
			instruction: "Label all the open string notes from memory. Start from the thickest string.",
			expectedLabels: [
				{ position: { string: 0, fret: 0 }, label: "E" },
				{ position: { string: 1, fret: 0 }, label: "A" },
				{ position: { string: 2, fret: 0 }, label: "D" },
				{ position: { string: 3, fret: 0 }, label: "G" },
				{ position: { string: 4, fret: 0 }, label: "B" },
				{ position: { string: 5, fret: 0 }, label: "E" },
			],
		},
	],
};

export default lesson;

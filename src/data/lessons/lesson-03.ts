import type { Lesson } from "@/types/lesson";

const lesson: Lesson = {
	id: "lesson-03-low-e-notes",
	title: "Natural Notes: Low E String",
	description:
		"Learn the four natural notes on the thickest string and why E–F are only one fret apart.",
	category: "notes",
	difficulty: "beginner",
	steps: [
		{
			type: "explain",
			title: "Your First String to Master",
			content:
				"The low E string (the thickest string) contains four natural notes within the first five frets: E, F, G, and A.\n\nNotice they're not evenly spaced:\n• E → F is 1 fret apart (a half step)\n• F → G is 2 frets apart (a whole step)\n• G → A is 2 frets apart (a whole step)\n\nClick each labeled note to hear its pitch.",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 0 }, label: "E", color: "#3B82F6" },
					{ position: { string: 0, fret: 1 }, label: "F", color: "#3B82F6" },
					{ position: { string: 0, fret: 3 }, label: "G", color: "#3B82F6" },
					{ position: { string: 0, fret: 5 }, label: "A", color: "#3B82F6" },
				],
				lines: [],
				highlightStrings: [0],
			},
		},
		{
			type: "explain",
			title: "E to F: A Half Step",
			content:
				"E and F have no sharp or flat between them — they are a half step apart, the smallest interval in Western music. On the fretboard that's just 1 fret.\n\nThis E→F relationship is one of only two places where natural notes are this close. The other is B→C.\n\nClick fret 0 (E) then fret 1 (F) slowly and listen for the tight, tense sound of the half step.",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 0 }, label: "E", color: "#10B981" },
					{ position: { string: 0, fret: 1 }, label: "F", color: "#F59E0B" },
				],
				lines: [
					{
						from: { string: 0, fret: 0 },
						to: { string: 0, fret: 1 },
						style: "solid",
						color: "#EF4444",
					},
				],
				highlightStrings: [0],
			},
		},
		{
			type: "verify",
			instruction: "Click the F note on the low E string.",
			targetPositions: [{ string: 0, fret: 1 }],
			fretboardState: {
				dots: [{ position: { string: 0, fret: 0 }, label: "E", color: "#10B981" }],
				lines: [],
			},
		},
		{
			type: "explain",
			title: "F to G and G to A: Whole Steps",
			content:
				"From F to G is 2 frets — a whole step. There's an F#/Gb note at fret 2 sitting between them.\n\nFrom G to A is also 2 frets (a whole step), with G#/Ab at fret 4 in between.\n\nClick F (fret 1), then G (fret 3), then A (fret 5) and hear how each jump sounds wider than the E→F step.",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 1 }, label: "F", color: "#6366F1" },
					{ position: { string: 0, fret: 3 }, label: "G", color: "#6366F1" },
					{ position: { string: 0, fret: 5 }, label: "A", color: "#6366F1" },
				],
				lines: [
					{
						from: { string: 0, fret: 1 },
						to: { string: 0, fret: 3 },
						style: "solid",
						color: "#6366F1",
					},
					{
						from: { string: 0, fret: 3 },
						to: { string: 0, fret: 5 },
						style: "solid",
						color: "#6366F1",
					},
				],
				highlightStrings: [0],
			},
		},
		{
			type: "verify",
			instruction: "Click the G note on the low E string.",
			targetPositions: [{ string: 0, fret: 3 }],
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 1 }, label: "F", color: "#10B981" },
					{ position: { string: 0, fret: 5 }, label: "A", color: "#10B981" },
				],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click the A note on the low E string.",
			targetPositions: [{ string: 0, fret: 5 }],
			fretboardState: {
				dots: [{ position: { string: 0, fret: 3 }, label: "G", color: "#10B981" }],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click all four natural notes on the low E string: E, F, G, and A.",
			targetPositions: [
				{ string: 0, fret: 0 },
				{ string: 0, fret: 1 },
				{ string: 0, fret: 3 },
				{ string: 0, fret: 5 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "teach-back",
			instruction:
				"Label all four natural notes on the low E string from memory. Click each fret position, then choose the note name.",
			expectedLabels: [
				{ position: { string: 0, fret: 0 }, label: "E" },
				{ position: { string: 0, fret: 1 }, label: "F" },
				{ position: { string: 0, fret: 3 }, label: "G" },
				{ position: { string: 0, fret: 5 }, label: "A" },
			],
		},
	],
};

export default lesson;

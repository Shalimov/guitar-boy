import type { Lesson } from "@/types/lesson";

const lesson: Lesson = {
	id: "lesson-02-first-position-notes",
	title: "First Position Note Map",
	description: "Learn and hear the natural notes across the first five frets.",
	category: "notes",
	difficulty: "beginner",
	steps: [
		{
			type: "explain",
			title: "Start with the first position",
			content:
				"The first five frets contain the core note map every guitarist should know. In this lesson, focus on the natural notes only: A, B, C, D, E, F, and G. Click any marked note to hear how the fretboard layout connects to pitch.",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 1 }, label: "F", color: "#2850a7" },
					{ position: { string: 0, fret: 3 }, label: "G", color: "#2850a7" },
					{ position: { string: 1, fret: 0 }, label: "A", color: "#2850a7" },
					{ position: { string: 1, fret: 2 }, label: "B", color: "#2850a7" },
					{ position: { string: 1, fret: 3 }, label: "C", color: "#2850a7" },
					{ position: { string: 2, fret: 0 }, label: "D", color: "#2850a7" },
					{ position: { string: 2, fret: 2 }, label: "E", color: "#2850a7" },
					{ position: { string: 2, fret: 3 }, label: "F", color: "#2850a7" },
					{ position: { string: 2, fret: 5 }, label: "G", color: "#2850a7" },
					{ position: { string: 3, fret: 0 }, label: "G", color: "#2850a7" },
					{ position: { string: 3, fret: 2 }, label: "A", color: "#2850a7" },
					{ position: { string: 3, fret: 4 }, label: "B", color: "#2850a7" },
					{ position: { string: 3, fret: 5 }, label: "C", color: "#2850a7" },
					{ position: { string: 4, fret: 0 }, label: "B", color: "#2850a7" },
					{ position: { string: 4, fret: 1 }, label: "C", color: "#2850a7" },
					{ position: { string: 4, fret: 3 }, label: "D", color: "#2850a7" },
					{ position: { string: 4, fret: 5 }, label: "E", color: "#2850a7" },
					{ position: { string: 5, fret: 0 }, label: "E", color: "#2850a7" },
					{ position: { string: 5, fret: 1 }, label: "F", color: "#2850a7" },
					{ position: { string: 5, fret: 3 }, label: "G", color: "#2850a7" },
				],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Find every C note between fret 0 and fret 5.",
			targetPositions: [
				{ string: 1, fret: 3 },
				{ string: 3, fret: 5 },
				{ string: 4, fret: 1 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "verify",
			instruction: "Find every G note between fret 0 and fret 5.",
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
			title: "Listen for landmarks",
			content:
				"Use strong reference points to memorize the neck: C lives on the A and B strings in first position, G appears on both outer strings, and open notes still matter. Replay these notes until you can predict their sound before you click.",
			fretboardState: {
				dots: [
					{ position: { string: 1, fret: 3 }, label: "C", color: "#10B981" },
					{ position: { string: 4, fret: 1 }, label: "C", color: "#10B981" },
					{ position: { string: 0, fret: 3 }, label: "G", color: "#10B981" },
					{ position: { string: 3, fret: 0 }, label: "G", color: "#10B981" },
					{ position: { string: 5, fret: 3 }, label: "G", color: "#10B981" },
				],
				lines: [],
			},
		},
		{
			type: "teach-back",
			instruction: "Recall all 'C' and 'G' positions in the first five frets from memory.",
			expectedLabels: [
				{ position: { string: 1, fret: 3 }, label: "C" },
				{ position: { string: 3, fret: 5 }, label: "C" },
				{ position: { string: 4, fret: 1 }, label: "C" },
				{ position: { string: 0, fret: 3 }, label: "G" },
				{ position: { string: 2, fret: 5 }, label: "G" },
				{ position: { string: 3, fret: 0 }, label: "G" },
				{ position: { string: 5, fret: 3 }, label: "G" },
			],
		},
	],
};

export default lesson;

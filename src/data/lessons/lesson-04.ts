import type { Lesson } from "@/types/lesson";

// Half-step pairs (E–F and B–C) visible in first position (frets 0–5):
//   E→F:  string 0 frets 0→1,  string 2 frets 2→3,  string 5 frets 0→1
//   B→C:  string 1 frets 2→3,  string 3 frets 4→5,  string 4 frets 0→1

const lesson: Lesson = {
	id: "lesson-04-half-whole-steps",
	title: "Listening: Half Steps and Whole Steps",
	description:
		"Train your ear to hear the difference between a half step (1 fret) and a whole step (2 frets) — the building blocks of every scale and melody.",
	category: "intervals",
	difficulty: "beginner",
	steps: [
		{
			type: "explain",
			title: "Two Distances That Build All Music",
			content:
				"Every scale and melody is constructed from just two basic intervals:\n\n• Half step — 1 fret apart. The tightest, most tense movement in music.\n• Whole step — 2 frets apart. The standard relaxed step used in most scales.\n\nLearning to hear these two distances will change how you understand everything you play. Click E (fret 0) and F (fret 1) to hear the half step, then F (fret 1) and G (fret 3) to hear the whole step. Compare the feel.",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 0 }, label: "E", color: "#EF4444" },
					{ position: { string: 0, fret: 1 }, label: "F", color: "#EF4444" },
					{ position: { string: 0, fret: 3 }, label: "G", color: "#3B82F6" },
				],
				lines: [
					{
						from: { string: 0, fret: 0 },
						to: { string: 0, fret: 1 },
						style: "solid",
						color: "#EF4444",
					},
					{
						from: { string: 0, fret: 1 },
						to: { string: 0, fret: 3 },
						style: "solid",
						color: "#3B82F6",
					},
				],
				highlightStrings: [0],
			},
		},
		{
			type: "explain",
			title: "Half Step: One Fret, Maximum Tension",
			content:
				"A half step is the distance of exactly 1 fret. On the low E string: E (fret 0) to F (fret 1) is a half step.\n\nThis tight interval creates tension — it's the sound of music wanting to move. Classical composers, jazz musicians, and rock guitarists all use half steps for emotional impact.\n\nClick E then F repeatedly and focus on that pulling sensation.",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 0 }, label: "½", color: "#EF4444" },
					{ position: { string: 0, fret: 1 }, label: "½", color: "#EF4444" },
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
			type: "explain",
			title: "Whole Step: Two Frets, Open Sound",
			content:
				"A whole step is 2 frets. From F (fret 1) to G (fret 3) is a whole step — there's an F#/Gb note at fret 2 sitting between them.\n\nThe whole step sounds more open and settled than the half step. Most of the motion in a major scale is whole steps, which gives it that bright, confident character.\n\nClick F (fret 1) then G (fret 3) and hear the difference from the tighter half step.",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 1 }, label: "W", color: "#3B82F6" },
					{ position: { string: 0, fret: 3 }, label: "W", color: "#3B82F6" },
				],
				lines: [
					{
						from: { string: 0, fret: 1 },
						to: { string: 0, fret: 3 },
						style: "solid",
						color: "#3B82F6",
					},
				],
				highlightStrings: [0],
			},
		},
		{
			type: "explain",
			title: "The Golden Rule: Only E–F and B–C Are Half Steps",
			content:
				"Among all the natural notes (A B C D E F G), only two adjacent pairs are a half step apart:\n\n• E → F (no sharp between them)\n• B → C (no sharp between them)\n\nEvery other pair of natural notes — A–B, C–D, D–E, F–G, G–A — is a whole step.\n\nThis is one of the most important facts in music theory. Knowing where these half steps fall unlocks the entire fretboard. Click the red dots to hear all four half-step pairs.",
			fretboardState: {
				dots: [
					// E–F pairs
					{ position: { string: 0, fret: 0 }, label: "E", color: "#EF4444" },
					{ position: { string: 0, fret: 1 }, label: "F", color: "#EF4444" },
					{ position: { string: 2, fret: 2 }, label: "E", color: "#EF4444" },
					{ position: { string: 2, fret: 3 }, label: "F", color: "#EF4444" },
					{ position: { string: 5, fret: 0 }, label: "E", color: "#EF4444" },
					{ position: { string: 5, fret: 1 }, label: "F", color: "#EF4444" },
					// B–C pairs
					{ position: { string: 1, fret: 2 }, label: "B", color: "#F59E0B" },
					{ position: { string: 1, fret: 3 }, label: "C", color: "#F59E0B" },
					{ position: { string: 3, fret: 4 }, label: "B", color: "#F59E0B" },
					{ position: { string: 3, fret: 5 }, label: "C", color: "#F59E0B" },
					{ position: { string: 4, fret: 0 }, label: "B", color: "#F59E0B" },
					{ position: { string: 4, fret: 1 }, label: "C", color: "#F59E0B" },
				],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction:
				"Click the note that is a half step above E on the low E string (string 6).",
			targetPositions: [{ string: 0, fret: 1 }],
			fretboardState: {
				dots: [{ position: { string: 0, fret: 0 }, label: "E", color: "#10B981" }],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction:
				"Click the note that is a half step above B on the B string (string 2).",
			targetPositions: [{ string: 4, fret: 1 }],
			fretboardState: {
				dots: [{ position: { string: 4, fret: 0 }, label: "B", color: "#10B981" }],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction:
				"Click the note that is a whole step above A on the A string (string 5). Remember: a whole step = 2 frets.",
			targetPositions: [{ string: 1, fret: 2 }],
			fretboardState: {
				dots: [{ position: { string: 1, fret: 0 }, label: "A", color: "#10B981" }],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction:
				"Click the note that is a whole step above D on the D string (string 4).",
			targetPositions: [{ string: 2, fret: 2 }],
			fretboardState: {
				dots: [{ position: { string: 2, fret: 0 }, label: "D", color: "#10B981" }],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction:
				"Find the half step B→C pair on the A string. Click both the B and C notes.",
			targetPositions: [
				{ string: 1, fret: 2 },
				{ string: 1, fret: 3 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "explain",
			title: "How This Unlocks Scale Building",
			content:
				"The major scale formula is: W W H W W W H\n\nBecause you now know exactly where E–F and B–C half steps live, you can build any major scale — or recognize when a note sounds 'wrong' — just by feeling where the tension falls.\n\nIn the next lesson, you'll apply this formula directly to the fretboard to build a complete major scale.",
			fretboardState: {
				dots: [
					{ position: { string: 3, fret: 0 }, label: "G", color: "#10B981" },
					{ position: { string: 3, fret: 2 }, label: "A", color: "#10B981" },
					{ position: { string: 3, fret: 4 }, label: "B", color: "#10B981" },
					{ position: { string: 3, fret: 5 }, label: "C", color: "#EF4444" },
				],
				lines: [
					{
						from: { string: 3, fret: 0 },
						to: { string: 3, fret: 2 },
						style: "solid",
						color: "#3B82F6",
					},
					{
						from: { string: 3, fret: 2 },
						to: { string: 3, fret: 4 },
						style: "solid",
						color: "#3B82F6",
					},
					{
						from: { string: 3, fret: 4 },
						to: { string: 3, fret: 5 },
						style: "solid",
						color: "#EF4444",
					},
				],
				highlightStrings: [3],
			},
		},
	],
};

export default lesson;

import type { Lesson } from "@/types/lesson";

// G major scale: G A B C D E F# G  (formula: W W H W W W H)
// On G string (string 3):  G(0) A(2) B(4) C(5)  — degrees 1 2 3 4
// On B string (string 4):  D(3) E(5)             — degrees 5 6
// F# (degree 7) is at string 4 fret 7, beyond the 0–5 display range.
// We show 6 of 7 notes and explain the 7th via text.

const lesson: Lesson = {
	id: "lesson-05-major-scale",
	title: "Building the Major Scale",
	description:
		"Apply the W–W–H–W–W–W–H formula step by step to build a G major scale across two strings.",
	category: "patterns",
	difficulty: "beginner",
	steps: [
		{
			type: "explain",
			title: "What Is a Scale?",
			content:
				"A scale is a sequence of notes arranged by pitch, following a specific pattern of whole steps (W) and half steps (H).\n\nThe major scale — the foundation of most Western music — always uses the same formula:\n\nW  W  H  W  W  W  H\n\nStart from any note, apply this pattern, and you get that note's major scale. The key is knowing where the half steps (1 fret) and whole steps (2 frets) fall.\n\nLet's build the G major scale starting on the open G string.",
			fretboardState: {
				dots: [{ position: { string: 3, fret: 0 }, label: "G", color: "#10B981" }],
				lines: [],
				highlightStrings: [3],
			},
		},
		{
			type: "explain",
			title: "Step 1: Whole–Whole–Half on the G String",
			content:
				"Starting from G (open G string), apply the first three steps of the formula:\n\n• G → A: W (+2 frets) → fret 2\n• A → B: W (+2 frets) → fret 4\n• B → C: H (+1 fret) → fret 5\n\nNotice how B–C is a half step — that's the E–F / B–C rule from the previous lesson. Click through G, A, B, C in order to hear the ascending major scale sound begin to take shape.",
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
		{
			type: "explain",
			title: "Step 2: Continuing on the B String",
			content:
				"After C (fret 5 on the G string), the scale continues on the next string. The B string opens on B — which is the 3rd of G major — so we jump to the 5th degree, D:\n\n• C → D: W (+2 frets from C) → B string fret 3\n• D → E: W (+2 frets) → B string fret 5\n• E → F#: W (+2 frets) → B string fret 7 (just beyond this view)\n• F# → G: H (+1 fret) → completes the octave\n\nHere you can hear D and E — degrees 5 and 6 of G major. Click them after C to feel the scale continue.",
			fretboardState: {
				dots: [
					{ position: { string: 3, fret: 0 }, label: "G", color: "#6B7280" },
					{ position: { string: 3, fret: 2 }, label: "A", color: "#6B7280" },
					{ position: { string: 3, fret: 4 }, label: "B", color: "#6B7280" },
					{ position: { string: 3, fret: 5 }, label: "C", color: "#6B7280" },
					{ position: { string: 4, fret: 3 }, label: "D", color: "#10B981" },
					{ position: { string: 4, fret: 5 }, label: "E", color: "#10B981" },
				],
				lines: [
					{
						from: { string: 4, fret: 3 },
						to: { string: 4, fret: 5 },
						style: "solid",
						color: "#3B82F6",
					},
				],
				highlightStrings: [3, 4],
			},
		},
		{
			type: "explain",
			title: "The Full G Major Scale Pattern",
			content:
				"Here is the complete visible portion of G major across strings 3 and 4:\n\nG string: G(0) – A(2) – B(4) – C(5)\nB string: D(3) – E(5) – [F# at fret 7] – [G at fret 8]\n\nThe formula W W H W W W H is embedded in these fret distances. The two half steps (H) are:\n• B → C: frets 4 to 5 on G string\n• F# → G: frets 7 to 8 on B string (the octave landing)\n\nPlay through all six visible notes from G to E. This is the sound of a major scale — bright, resolved, optimistic.",
			fretboardState: {
				dots: [
					{ position: { string: 3, fret: 0 }, label: "1", color: "#10B981" },
					{ position: { string: 3, fret: 2 }, label: "2", color: "#3B82F6" },
					{ position: { string: 3, fret: 4 }, label: "3", color: "#3B82F6" },
					{ position: { string: 3, fret: 5 }, label: "4", color: "#F59E0B" },
					{ position: { string: 4, fret: 3 }, label: "5", color: "#3B82F6" },
					{ position: { string: 4, fret: 5 }, label: "6", color: "#3B82F6" },
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
					{
						from: { string: 4, fret: 3 },
						to: { string: 4, fret: 5 },
						style: "solid",
						color: "#3B82F6",
					},
				],
			},
		},
		{
			type: "verify",
			instruction: "Click all four notes of G major on the G string (string 3): G, A, B, and C.",
			targetPositions: [
				{ string: 3, fret: 0 },
				{ string: 3, fret: 2 },
				{ string: 3, fret: 4 },
				{ string: 3, fret: 5 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "verify",
			instruction: "Click the 5th (D) and 6th (E) degrees of G major on the B string (string 2).",
			targetPositions: [
				{ string: 4, fret: 3 },
				{ string: 4, fret: 5 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "verify",
			instruction:
				"The half step in the lower part of G major is B→C. Click both B and C on the G string.",
			targetPositions: [
				{ string: 3, fret: 4 },
				{ string: 3, fret: 5 },
			],
			fretboardState: {
				dots: [
					{ position: { string: 3, fret: 0 }, label: "G", color: "#6B7280" },
					{ position: { string: 3, fret: 2 }, label: "A", color: "#6B7280" },
				],
				lines: [],
			},
		},
		{
			type: "teach-back",
			instruction: "Label the first four notes of G major on the G string from memory: G, A, B, C.",
			expectedLabels: [
				{ position: { string: 3, fret: 0 }, label: "G" },
				{ position: { string: 3, fret: 2 }, label: "A" },
				{ position: { string: 3, fret: 4 }, label: "B" },
				{ position: { string: 3, fret: 5 }, label: "C" },
			],
		},
	],
};

export default lesson;

import type { Lesson } from "@/types/lesson";

// The central insight: major → minor by lowering the 3rd by ONE half step (1 fret).
//
// Comparison frame — C major vs C minor on A and D strings:
//   C major: C(s1f3)  E(s2f2)  G(s2f5)   — root on A string, 3rd and 5th on D string
//   C minor: C(s1f3)  Eb(s2f1) G(s2f5)   — only the E moves down by 1 fret → Eb
//
// A minor chord = A (root), C (minor 3rd), E (perfect 5th) — all natural notes.
// Nice positions for teach-back:
//   A: string 1 fret 0 (open)
//   C: string 4 fret 1
//   E: string 2 fret 2
//
// Full first-position map:
//   A: s1f0, s3f2
//   C: s1f3, s3f5, s4f1
//   E: s0f0, s2f2, s5f0

const lesson: Lesson = {
	id: "lesson-07-minor-chords",
	title: "Building Minor Chords",
	description:
		"Discover how flattening the 3rd by one fret transforms a major chord into minor — and hear the emotional difference.",
	category: "chords",
	difficulty: "beginner",
	steps: [
		{
			type: "explain",
			title: "Major vs Minor: One Note Changes Everything",
			content:
				"Major and minor chords are almost identical — they share the same root and perfect 5th. The only difference is the third:\n\n• Major chord: 1 – 3 – 5  (major 3rd: 4 semitones above root)\n• Minor chord: 1 – b3 – 5  (minor 3rd: 3 semitones above root — one fret lower)\n\nLowering that one note by a single half step shifts the chord from bright and resolved to dark and emotional. This tiny change is the basis of all tension in music.",
			fretboardState: {
				dots: [
					{ position: { string: 3, fret: 0 }, label: "1", color: "#10B981" },
				],
				lines: [],
				highlightStrings: [3],
			},
		},
		{
			type: "explain",
			title: "Hearing the Difference: C Major vs C Minor",
			content:
				"On the A and D strings, C major uses: C (A string fret 3), E (D string fret 2), G (D string fret 5).\n\nTo make it C minor, lower only the E by one fret: E (fret 2) becomes Eb (fret 1).\n\nClick the green (major) shape: C, E, G.\nThen click the red (minor) shape: C, Eb, G.\n\nThe root (C) and 5th (G) stay the same — only the 3rd moves. Listen carefully to how the chord changes character from that single fret difference.",
			fretboardState: {
				dots: [
					// C major (green)
					{ position: { string: 1, fret: 3 }, label: "C", color: "#10B981" },
					{ position: { string: 2, fret: 2 }, label: "E", color: "#10B981" },
					{ position: { string: 2, fret: 5 }, label: "G", color: "#10B981" },
					// C minor — Eb shown in red
					{ position: { string: 2, fret: 1 }, label: "Eb", color: "#EF4444" },
				],
				lines: [
					{
						from: { string: 2, fret: 1 },
						to: { string: 2, fret: 2 },
						style: "dashed",
						color: "#EF4444",
					},
				],
			},
		},
		{
			type: "explain",
			title: "A Minor: A + C + E",
			content:
				"A minor is one of the most important chords in guitar. Its formula:\n\n• Root (A): open A string (fret 0)\n• Minor 3rd (C): 3 semitones above A = C — B string fret 1\n• Perfect 5th (E): 7 semitones above A = E — D string fret 2, or low/high E open\n\nAll three chord tones are natural notes, making A minor easy to find across the fretboard. The open A string, the low E string, and the high e string are all chord tones!\n\nClick through A, C, E and hear that classic minor sound.",
			fretboardState: {
				dots: [
					// A notes (root)
					{ position: { string: 1, fret: 0 }, label: "A", color: "#10B981" },
					{ position: { string: 3, fret: 2 }, label: "A", color: "#10B981" },
					// C notes (minor 3rd)
					{ position: { string: 1, fret: 3 }, label: "C", color: "#EF4444" },
					{ position: { string: 3, fret: 5 }, label: "C", color: "#EF4444" },
					{ position: { string: 4, fret: 1 }, label: "C", color: "#EF4444" },
					// E notes (perfect 5th)
					{ position: { string: 0, fret: 0 }, label: "E", color: "#6366F1" },
					{ position: { string: 2, fret: 2 }, label: "E", color: "#6366F1" },
					{ position: { string: 5, fret: 0 }, label: "E", color: "#6366F1" },
				],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction:
				"For C minor, only the 3rd changes. Click the Eb — one fret below the E on the D string.",
			targetPositions: [{ string: 2, fret: 1 }],
			fretboardState: {
				dots: [
					{ position: { string: 1, fret: 3 }, label: "C", color: "#10B981" },
					{ position: { string: 2, fret: 2 }, label: "E↓?", color: "#F59E0B" },
					{ position: { string: 2, fret: 5 }, label: "G", color: "#10B981" },
				],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction:
				"Click all three A notes (the root of A minor) visible in first position.",
			targetPositions: [
				{ string: 1, fret: 0 },
				{ string: 3, fret: 2 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "verify",
			instruction:
				"Click the three notes of an A minor chord: A (open A string), E (D string fret 2), and C (B string fret 1).",
			targetPositions: [
				{ string: 1, fret: 0 },
				{ string: 2, fret: 2 },
				{ string: 4, fret: 1 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "explain",
			title: "Compare: A Major vs A Minor",
			content:
				"A major uses: A, C#, E (the C# is not shown on a natural-notes-only view).\nA minor uses: A, C, E (all natural notes).\n\nThe difference is C# vs C — just one fret. Click A (open), then E (D string fret 2), and finally C (B string fret 1) to hear A minor. Then try moving that C up one fret to C# (fret 2) and hear it brighten into A major.\n\nThis is the magic of the minor 3rd: one fret, completely different emotion.",
			fretboardState: {
				dots: [
					{ position: { string: 1, fret: 0 }, label: "A", color: "#10B981" },
					{ position: { string: 2, fret: 2 }, label: "E", color: "#6366F1" },
					{ position: { string: 4, fret: 1 }, label: "C", color: "#EF4444" },
					{ position: { string: 4, fret: 2 }, label: "C#", color: "#F59E0B" },
				],
				lines: [
					{
						from: { string: 4, fret: 1 },
						to: { string: 4, fret: 2 },
						style: "dashed",
						color: "#F59E0B",
					},
				],
			},
		},
		{
			type: "verify",
			instruction:
				"Click all three C notes (the minor 3rd of A minor) in first position.",
			targetPositions: [
				{ string: 1, fret: 3 },
				{ string: 3, fret: 5 },
				{ string: 4, fret: 1 },
			],
			fretboardState: { dots: [], lines: [] },
		},
		{
			type: "teach-back",
			instruction:
				"Label the three A minor chord tones from memory: A on the open A string, E on the D string fret 2, and C on the B string fret 1.",
			expectedLabels: [
				{ position: { string: 1, fret: 0 }, label: "A" },
				{ position: { string: 2, fret: 2 }, label: "E" },
				{ position: { string: 4, fret: 1 }, label: "C" },
			],
		},
	],
};

export default lesson;

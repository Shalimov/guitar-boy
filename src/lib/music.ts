import type {
	AccidentalPreference,
	FretPosition,
	IntervalFormulaToken,
	IntervalName,
	NoteName,
	TriadQuality,
} from "@/types";

/** Standard tuning: open string notes from string 0 (low E) to string 5 (high e) */
const STANDARD_TUNING: readonly NoteName[] = ["E", "A", "D", "G", "B", "E"];
const STANDARD_TUNING_MIDI: readonly number[] = [40, 45, 50, 55, 59, 64];

/** Chromatic scale in order */
const CHROMATIC: readonly NoteName[] = [
	"C",
	"C#/Db",
	"D",
	"D#/Eb",
	"E",
	"F",
	"F#/Gb",
	"G",
	"G#/Ab",
	"A",
	"A#/Bb",
	"B",
];

const SHARP_NOTE_LABELS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NOTE_LABELS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const INTERVAL_FORMULA_TO_SEMITONES: Record<IntervalFormulaToken, number> = {
	"1": 0,
	b2: 1,
	"2": 2,
	b3: 3,
	"3": 4,
	"4": 5,
	b5: 6,
	"#4": 6,
	"5": 7,
	"#5": 8,
	b6: 8,
	"6": 9,
	b7: 10,
	"7": 11,
	"8": 12,
};

const SEMITONE_TO_FORMULA: Record<number, IntervalFormulaToken> = {
	0: "1",
	1: "b2",
	2: "2",
	3: "b3",
	4: "3",
	5: "4",
	6: "b5",
	7: "5",
	8: "b6",
	9: "6",
	10: "b7",
	11: "7",
	12: "8",
};

export const CHROMATIC_NOTES = CHROMATIC;

export const SCALE_FORMULAS: Record<string, IntervalFormulaToken[]> = {
	"Major Scale": ["1", "2", "3", "4", "5", "6", "7"],
	"Natural Minor Scale": ["1", "2", "b3", "4", "5", "b6", "b7"],
	"Minor Pentatonic Scale": ["1", "b3", "4", "5", "b7"],
	"Major Pentatonic Scale": ["1", "2", "3", "5", "6"],
	"Blues Scale": ["1", "b3", "4", "b5", "5", "b7"],
	"Harmonic Minor Scale": ["1", "2", "b3", "4", "5", "b6", "7"],
	"Melodic Minor Scale": ["1", "2", "b3", "4", "5", "6", "7"],
	Mixolydian: ["1", "2", "3", "4", "5", "6", "b7"],
	"Chromatic Scale": ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"],
};

export const CHORD_FORMULAS: Record<string, IntervalFormulaToken[]> = {
	Major: ["1", "3", "5"],
	Minor: ["1", "b3", "5"],
	Diminished: ["1", "b3", "b5"],
	Augmented: ["1", "3", "#5"],
	Maj7: ["1", "3", "5", "7"],
	Min7: ["1", "b3", "5", "b7"],
	Dom7: ["1", "3", "5", "b7"],
	"Half-Diminished": ["1", "b3", "b5", "b7"],
};

export const ARPEGGIO_FORMULAS: Record<string, IntervalFormulaToken[]> = CHORD_FORMULAS;

export const INTERVAL_FORMULAS: Record<string, IntervalFormulaToken[]> = {
	"Minor 2nd": ["1", "b2"],
	"Major 2nd": ["1", "2"],
	"Minor 3rd": ["1", "b3"],
	"Major 3rd": ["1", "3"],
	"Perfect 4th": ["1", "4"],
	Tritone: ["1", "b5"],
	"Perfect 5th": ["1", "5"],
	"Minor 6th": ["1", "b6"],
	"Major 6th": ["1", "6"],
	"Minor 7th": ["1", "b7"],
	"Major 7th": ["1", "7"],
	Octave: ["1", "8"],
};

/** Semitone to interval name mapping */
const SEMITONE_TO_INTERVAL: Record<number, IntervalName> = {
	0: "Unison",
	1: "m2",
	2: "M2",
	3: "m3",
	4: "M3",
	5: "P4",
	6: "Tritone",
	7: "P5",
	8: "m6",
	9: "M6",
	10: "m7",
	11: "M7",
	12: "Octave",
};

/** All interval names in order */
export const INTERVAL_NAMES: IntervalName[] = [
	"Unison",
	"m2",
	"M2",
	"m3",
	"M3",
	"P4",
	"Tritone",
	"P5",
	"m6",
	"M6",
	"m7",
	"M7",
	"Octave",
];

/**
 * Get the note at a given fret position in standard tuning.
 */
export function getNoteAtFret(position: FretPosition): NoteName {
	const openNote = STANDARD_TUNING[position.string];
	const openIndex = CHROMATIC.indexOf(openNote);
	const noteIndex = (openIndex + position.fret) % 12;
	return CHROMATIC[noteIndex];
}

/**
 * Get the semitone distance between two notes in the chromatic scale.
 */
export function getSemitoneDistance(from: NoteName, to: NoteName): number {
	const fromIndex = CHROMATIC.indexOf(from);
	const toIndex = CHROMATIC.indexOf(to);
	return (toIndex - fromIndex + 12) % 12;
}

export function getDisplayNoteName(
	note: NoteName,
	preference: AccidentalPreference = "sharp",
): string {
	const noteIndex = CHROMATIC.indexOf(note);
	const labels = preference === "flat" ? FLAT_NOTE_LABELS : SHARP_NOTE_LABELS;
	return labels[noteIndex] ?? note;
}

export function getConstructNotes(root: NoteName, formula: IntervalFormulaToken[]): NoteName[] {
	const rootIndex = CHROMATIC.indexOf(root);
	return formula.map((token) => CHROMATIC[(rootIndex + INTERVAL_FORMULA_TO_SEMITONES[token]) % 12]);
}

export function getIntervalFormulaToken(root: NoteName, note: NoteName): IntervalFormulaToken {
	return SEMITONE_TO_FORMULA[getSemitoneDistance(root, note)] ?? "1";
}

export function getFrequencyAtFret(position: FretPosition): number {
	const midiNote = STANDARD_TUNING_MIDI[position.string] + position.fret;
	return 440 * 2 ** ((midiNote - 69) / 12);
}

/**
 * Get the interval between two fret positions.
 */
export function getInterval(from: FretPosition, to: FretPosition): IntervalName {
	const fromNote = getNoteAtFret(from);
	const toNote = getNoteAtFret(to);

	if (from.string === to.string) {
		const fretDiff = Math.abs(to.fret - from.fret);
		if (fretDiff === 12) return "Octave";
		if (fretDiff === 0) return "Unison";
		return SEMITONE_TO_INTERVAL[fretDiff % 12] || "Unison";
	}

	const semitones = getSemitoneDistance(fromNote, toNote);
	return SEMITONE_TO_INTERVAL[semitones];
}

/**
 * Get the chord tones for a given root and quality.
 */
export function getChordTones(root: NoteName, quality: TriadQuality): NoteName[] {
	const rootIndex = CHROMATIC.indexOf(root);

	const intervals: Record<TriadQuality, number[]> = {
		major: [0, 4, 7],
		minor: [0, 3, 7],
		diminished: [0, 3, 6],
		augmented: [0, 4, 8],
	};

	return intervals[quality].map((semitones) => {
		const noteIndex = (rootIndex + semitones) % 12;
		return CHROMATIC[noteIndex];
	});
}

/**
 * Validate if placed positions match required chord tones.
 */
export function isChordCorrect(
	placed: FretPosition[],
	required: NoteName[],
): { correct: boolean; missing: NoteName[]; extra: NoteName[] } {
	const placedNotes = [...new Set(placed.map((pos) => getNoteAtFret(pos)))];
	const requiredSet = new Set(required);

	const missing = required.filter((note) => !placedNotes.includes(note));
	const extra = placedNotes.filter((note) => !requiredSet.has(note));

	return {
		correct: missing.length === 0,
		missing,
		extra,
	};
}

/** Natural notes (no accidentals/sharps/flats) */
export const NATURAL_NOTES: readonly NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

/**
 * Returns true if the given note is a natural note (no sharp/flat).
 */
export function isNaturalNote(note: NoteName): boolean {
	return NATURAL_NOTES.includes(note);
}

/**
 * Find all positions of a given note within a fret range.
 */
export function getAllPositionsOfNote(note: NoteName, fretRange: [number, number]): FretPosition[] {
	const positions: FretPosition[] = [];
	const [minFret, maxFret] = fretRange;

	for (let string = 0; string < 6; string++) {
		for (let fret = minFret; fret <= maxFret; fret++) {
			const noteAtPos = getNoteAtFret({ string, fret });
			if (noteAtPos === note) {
				positions.push({ string, fret });
			}
		}
	}

	return positions.sort((a, b) => {
		if (a.string !== b.string) return a.string - b.string;
		return a.fret - b.fret;
	});
}

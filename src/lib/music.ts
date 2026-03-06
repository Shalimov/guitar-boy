import type { FretPosition, IntervalName, NoteName, TriadQuality } from "@/types";

/** Standard tuning: open string notes from string 0 (low E) to string 5 (high e) */
const STANDARD_TUNING: readonly NoteName[] = ["E", "A", "D", "G", "B", "E"];

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

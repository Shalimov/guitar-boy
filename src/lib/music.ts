import type { FretPosition, NoteName } from "@/types";

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

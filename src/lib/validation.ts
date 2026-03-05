import type { FretPosition, NoteName, SRSCard } from "@/types";

/**
 * Validate a FretPosition object
 */
export function validateFretPosition(pos: unknown): pos is FretPosition {
	if (typeof pos !== "object" || pos === null) return false;
	const p = pos as Record<string, unknown>;
	return (
		typeof p.string === "number" &&
		typeof p.fret === "number" &&
		p.string >= 0 &&
		p.string <= 5 &&
		p.fret >= 0 &&
		p.fret <= 24
	);
}

/**
 * Validate a NoteName value
 */
export function validateNoteName(note: unknown): note is NoteName {
	const validNotes: NoteName[] = [
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
	return typeof note === "string" && validNotes.includes(note as NoteName);
}

/**
 * Validate an SRSCard object
 */
export function validateSRSCard(card: unknown): card is SRSCard {
	if (typeof card !== "object" || card === null) return false;
	const c = card as Record<string, unknown>;

	return (
		typeof c.id === "string" &&
		typeof c.category === "string" &&
		["note", "interval", "chord"].includes(c.category as string) &&
		typeof c.subCategory === "string" &&
		typeof c.easeFactor === "number" &&
		c.easeFactor >= 1.3 &&
		c.easeFactor <= 3.0 &&
		typeof c.intervalDays === "number" &&
		c.intervalDays >= 0 &&
		typeof c.nextReviewAt === "string" &&
		typeof c.repetitions === "number" &&
		c.repetitions >= 0 &&
		(c.lastAccuracy === null ||
			(typeof c.lastAccuracy === "number" && c.lastAccuracy >= 0 && c.lastAccuracy <= 1))
	);
}

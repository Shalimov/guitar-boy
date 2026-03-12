import type { FretPosition } from "@/types";

/**
 * Position-keyed error tracking.
 * Key format: "s{string}f{fret}" e.g. "s2f5"
 */
export type PositionErrorKey = `s${number}f${number}`;

export interface MistakeLog {
	/** Error counts keyed by position */
	errors: Record<PositionErrorKey, number>;
	/** Total errors recorded */
	totalErrors: number;
}

export interface HeatMapEntry {
	position: FretPosition;
	errorCount: number;
	/** 0 = no errors (green), 1 = max errors (red) */
	heatLevel: number;
}

/**
 * Create a position error key from a FretPosition.
 */
export function toErrorKey(position: FretPosition): PositionErrorKey {
	return `s${position.string}f${position.fret}`;
}

/**
 * Parse a position error key back to a FretPosition.
 */
export function fromErrorKey(key: string): FretPosition {
	const match = key.match(/^s(\d+)f(\d+)$/);
	if (!match) throw new Error(`Invalid error key: ${key}`);
	return { string: Number(match[1]), fret: Number(match[2]) };
}

/**
 * Record errors for given positions into a mistake log.
 * Returns a new MistakeLog (immutable).
 */
export function recordErrors(log: MistakeLog, positions: FretPosition[]): MistakeLog {
	const newErrors = { ...log.errors };
	let added = 0;
	for (const pos of positions) {
		const key = toErrorKey(pos);
		newErrors[key] = (newErrors[key] ?? 0) + 1;
		added++;
	}
	return { errors: newErrors, totalErrors: log.totalErrors + added };
}

/**
 * Generate heat map entries for all positions in a fret range.
 * Normalizes error counts to a 0–1 heat level.
 *
 * @param log - The mistake log
 * @param fretRange - [minFret, maxFret] range to generate entries for
 */
export function generateHeatMap(
	log: MistakeLog,
	fretRange: [number, number] = [0, 12],
): HeatMapEntry[] {
	const entries: HeatMapEntry[] = [];
	let maxErrors = 0;

	// 1. Generate all positions in fretRange
	for (let s = 0; s < 6; s++) {
		for (let f = fretRange[0]; f <= fretRange[1]; f++) {
			const pos = { string: s, fret: f };
			const errorCount = log.errors[toErrorKey(pos)] ?? 0;
			if (errorCount > maxErrors) maxErrors = errorCount;
			entries.push({
				position: pos,
				errorCount,
				heatLevel: 0, // Will normalized below
			});
		}
	}

	// 2. Normalize
	if (maxErrors > 0) {
		for (const entry of entries) {
			entry.heatLevel = entry.errorCount / maxErrors;
		}
	}

	return entries;
}

/**
 * Get the top N problem areas sorted by error count (descending).
 */
export function getTopProblemAreas(log: MistakeLog, count = 5): HeatMapEntry[] {
	const entries = Object.entries(log.errors).map(([key, errorCount]) => ({
		position: fromErrorKey(key),
		errorCount,
		heatLevel: 0,
	}));

	return entries.sort((a, b) => b.errorCount - a.errorCount).slice(0, count);
}

/**
 * Map a heat level (0–1) to a color.
 * 0 = green (#16a34a), 0.5 = yellow (#ca8a04), 1 = red (#dc2626)
 */
export function heatColor(level: number): string {
	if (level === 0) return "#22c55e30"; // green with low opacity (no errors)
	if (level < 0.33) return "#22c55e80";
	if (level < 0.66) return "#ca8a04a0";
	return "#dc2626c0";
}

export const EMPTY_MISTAKE_LOG: MistakeLog = { errors: {}, totalErrors: 0 };

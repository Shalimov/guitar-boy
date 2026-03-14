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
 * Map a heat level (0–1) to a color using app's design system.
 * Uses CSS custom properties for consistent theming in light/dark modes.
 * 0 = transparent/no heat, 0.5 = medium heat, 1 = high heat
 */
export function heatColor(level: number): string {
	// Use gb-accent color family with varying opacity for heat intensity
	// This maintains consistency with the app's warm color palette
	if (level === 0) return "transparent";
	if (level < 0.25) return "color-mix(in srgb, var(--gb-accent) 15%, transparent)";
	if (level < 0.5) return "color-mix(in srgb, var(--gb-accent) 35%, transparent)";
	if (level < 0.75) return "color-mix(in srgb, var(--gb-accent-strong) 50%, transparent)";
	return "color-mix(in srgb, var(--gb-accent-strong) 75%, transparent)";
}

/**
 * Get a descriptive label for a heat level.
 */
export function heatLevelLabel(level: number): string {
	if (level === 0) return "Solid";
	if (level < 0.25) return "Minor";
	if (level < 0.5) return "Moderate";
	if (level < 0.75) return "Significant";
	return "Critical";
}

/**
 * Calculate statistics from the heat map for display.
 */
export function calculateHeatMapStats(
	log: MistakeLog,
	fretRange: [number, number] = [0, 12],
): {
	totalPositions: number;
	positionsWithErrors: number;
	averageErrorsPerPosition: number;
	totalCells: number;
	coveragePercent: number;
	worstString: { string: number; errorCount: number } | null;
} {
	const entries = generateHeatMap(log, fretRange);
	const positionsWithErrors = entries.filter((e) => e.errorCount > 0);

	// Calculate errors by string
	const stringErrors = new Map<number, number>();
	for (const entry of positionsWithErrors) {
		const current = stringErrors.get(entry.position.string) ?? 0;
		stringErrors.set(entry.position.string, current + entry.errorCount);
	}

	let worstString: { string: number; errorCount: number } | null = null;
	for (const [stringIndex, errorCount] of stringErrors) {
		if (!worstString || errorCount > worstString.errorCount) {
			worstString = { string: stringIndex, errorCount };
		}
	}

	const totalErrors = positionsWithErrors.reduce((sum, e) => sum + e.errorCount, 0);
	const totalCells = entries.length;

	return {
		totalPositions: positionsWithErrors.length,
		positionsWithErrors: positionsWithErrors.length,
		averageErrorsPerPosition:
			positionsWithErrors.length > 0 ? totalErrors / positionsWithErrors.length : 0,
		totalCells,
		coveragePercent: Math.round((positionsWithErrors.length / totalCells) * 100),
		worstString,
	};
}

export const EMPTY_MISTAKE_LOG: MistakeLog = { errors: {}, totalErrors: 0 };

import type { ScaleDegree } from "@/types/earTraining";
import { DEGREE_LABELS, DEGREE_UNLOCK_ORDER } from "@/types/earTraining";

export interface HintData {
	level: number;
	text: string;
	/** For level 4, the degree to compare against */
	comparisonDegree?: ScaleDegree;
}

/** Semitone values for each degree to determine direction/region */
const DEGREE_SEMITONES: Record<ScaleDegree, number> = {
	"1": 0,
	b2: 1,
	"2": 2,
	b3: 3,
	"3": 4,
	"4": 5,
	b5: 6,
	"5": 7,
	b6: 8,
	"6": 9,
	b7: 10,
	"7": 11,
};

function getNeighborDegrees(
	degree: ScaleDegree,
	unlocked: ScaleDegree[],
): { below: ScaleDegree | null; above: ScaleDegree | null } {
	const semitone = DEGREE_SEMITONES[degree];
	const sorted = [...unlocked].sort((a, b) => DEGREE_SEMITONES[a] - DEGREE_SEMITONES[b]);

	let below: ScaleDegree | null = null;
	let above: ScaleDegree | null = null;

	for (const d of sorted) {
		if (DEGREE_SEMITONES[d] < semitone) below = d;
	}
	for (const d of sorted) {
		if (DEGREE_SEMITONES[d] > semitone) {
			above = d;
			break;
		}
	}

	return { below, above };
}

/**
 * Get a hint for the given degree at the specified hint level.
 *
 * - Level 1: Direction ("above" or "below" the root)
 * - Level 2: Region (lower/middle/upper part of the scale)
 * - Level 3: Neighbor ("between X and Y" or "next to X")
 * - Level 4: Comparison play (returns which degree to play side-by-side)
 */
export function getHint(
	targetDegree: ScaleDegree,
	hintLevel: number,
	unlockedDegrees: ScaleDegree[],
): HintData | null {
	if (hintLevel < 1 || hintLevel > 4) return null;

	const semitone = DEGREE_SEMITONES[targetDegree];

	if (hintLevel === 1) {
		if (semitone === 0) {
			return { level: 1, text: "This is the home note (root)" };
		}
		const direction = semitone <= 6 ? "in the lower half" : "in the upper half";
		return { level: 1, text: `The note is ${direction} of the scale` };
	}

	if (hintLevel === 2) {
		let region: string;
		if (semitone <= 3) region = "near the bottom of the scale (1-3)";
		else if (semitone <= 7) region = "in the middle of the scale (4-5)";
		else region = "near the top of the scale (6-7)";
		return { level: 2, text: `It's ${region}` };
	}

	if (hintLevel === 3) {
		const { below, above } = getNeighborDegrees(targetDegree, unlockedDegrees);
		if (below && above) {
			return {
				level: 3,
				text: `It's between ${below} (${DEGREE_LABELS[below]}) and ${above} (${DEGREE_LABELS[above]})`,
			};
		}
		if (below) {
			return {
				level: 3,
				text: `It's just above ${below} (${DEGREE_LABELS[below]})`,
			};
		}
		if (above) {
			return {
				level: 3,
				text: `It's just below ${above} (${DEGREE_LABELS[above]})`,
			};
		}
		return { level: 3, text: `It's the ${DEGREE_LABELS[targetDegree]}` };
	}

	// Level 4: comparison play
	const { below, above } = getNeighborDegrees(targetDegree, unlockedDegrees);
	const comparisonDegree = below ?? above ?? "1";
	return {
		level: 4,
		text: `Listen: this is ${comparisonDegree} (${DEGREE_LABELS[comparisonDegree]}), and now the mystery note...`,
		comparisonDegree,
	};
}

/** Maximum hint level available */
export const MAX_HINT_LEVEL = 4;

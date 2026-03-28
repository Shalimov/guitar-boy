import type { ConfusionPair, ScaleDegree } from "@/types/earTraining";

/** Sort key for consistent pair identity regardless of order */
function pairKey(a: ScaleDegree, b: ScaleDegree): string {
	return [a, b].sort().join(":");
}

/** Record a confusion event (user answered `guessed` when `actual` was correct) */
export function recordConfusion(
	pairs: ConfusionPair[],
	actual: ScaleDegree,
	guessed: ScaleDegree,
): ConfusionPair[] {
	if (actual === guessed) return pairs;

	const key = pairKey(actual, guessed);
	const existing = pairs.find((p) => pairKey(p.degreeA, p.degreeB) === key);

	if (existing) {
		return pairs.map((p) =>
			pairKey(p.degreeA, p.degreeB) === key
				? { ...p, count: p.count + 1, lastDrilled: new Date().toISOString().slice(0, 10) }
				: p,
		);
	}

	const [degreeA, degreeB] = [actual, guessed].sort() as [ScaleDegree, ScaleDegree];
	return [
		...pairs,
		{
			degreeA,
			degreeB,
			count: 1,
			lastDrilled: new Date().toISOString().slice(0, 10),
		},
	];
}

/** Get the top N most confused pairs, sorted by count descending */
export function getTopConfusions(pairs: ConfusionPair[], count: number): ConfusionPair[] {
	return [...pairs].sort((a, b) => b.count - a.count).slice(0, count);
}

/** Pick the most confused pair for a targeted drill */
export function generateConfusionDrill(
	pairs: ConfusionPair[],
): { degreeA: ScaleDegree; degreeB: ScaleDegree } | null {
	if (pairs.length === 0) return null;
	const top = getTopConfusions(pairs, 1)[0];
	return { degreeA: top.degreeA, degreeB: top.degreeB };
}

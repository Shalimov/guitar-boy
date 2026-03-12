import type { Tip } from "@/data/tips";
import { findTip } from "@/data/tips";
import type { FretPosition } from "@/types";

const ERROR_THRESHOLD = 3;

export function shouldShowTip(
	note: string,
	position: FretPosition,
	errorCount: number,
	dismissedTipIds: string[],
): Tip | null {
	if (errorCount < ERROR_THRESHOLD) return null;
	const tip = findTip(note, position);
	if (!tip || dismissedTipIds.includes(tip.id)) return null;
	return tip;
}

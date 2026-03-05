import type { FretPosition } from "@/types";
import type { CanvasCellBounds, CanvasLayoutConfig, CanvasMetrics, CanvasPoint } from "./types";

const DEFAULT_STRING_COUNT = 6;
const DEFAULT_PADDING = {
	top: 40,
	right: 24,
	bottom: 24,
	left: 60,
};

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function normalizeFretRange(fretRange: [number, number]): [number, number] {
	const [a, b] = fretRange;
	return a <= b ? [a, b] : [b, a];
}

export function createCanvasMetrics(config: CanvasLayoutConfig): CanvasMetrics {
	const width = Math.max(1, config.width);
	const height = Math.max(1, config.height);
	const [minFret, maxFret] = normalizeFretRange(config.fretRange);
	const stringCount = Math.max(1, Math.floor(config.stringCount ?? DEFAULT_STRING_COUNT));
	const fretCount = Math.max(1, maxFret - minFret + 1);
	const padding = {
		...DEFAULT_PADDING,
		...config.padding,
	};

	const playableWidth = Math.max(1, width - padding.left - padding.right);
	const playableHeight = Math.max(1, height - padding.top - padding.bottom);
	const fretSpacing = playableWidth / fretCount;
	const stringSpacing = stringCount > 1 ? playableHeight / (stringCount - 1) : playableHeight;

	return {
		width,
		height,
		fretRange: [minFret, maxFret],
		minFret,
		maxFret,
		fretCount,
		stringCount,
		padding,
		playableWidth,
		playableHeight,
		fretSpacing,
		stringSpacing,
	};
}

export function positionToCanvasPoint(metrics: CanvasMetrics, position: FretPosition): CanvasPoint {
	const clampedString = clamp(position.string, 0, metrics.stringCount - 1);
	const clampedFret = clamp(position.fret, metrics.minFret, metrics.maxFret);

	return {
		x: metrics.padding.left + (clampedFret - metrics.minFret + 0.5) * metrics.fretSpacing,
		y: metrics.padding.top + clampedString * metrics.stringSpacing,
	};
}

export function positionToCellBounds(
	metrics: CanvasMetrics,
	position: FretPosition,
): CanvasCellBounds {
	const center = positionToCanvasPoint(metrics, position);
	const width = Math.max(1, metrics.fretSpacing);
	const height = Math.max(1, metrics.stringSpacing);
	const clampedPosition: FretPosition = canvasPointToNearestPosition(metrics, center);

	return {
		position: clampedPosition,
		x: center.x - width / 2,
		y: center.y - height / 2,
		width,
		height,
		center,
	};
}

export function canvasPointToNearestPosition(
	metrics: CanvasMetrics,
	point: CanvasPoint,
): FretPosition {
	const fretOffset = Math.floor(
		(point.x - metrics.padding.left) / Math.max(1, metrics.fretSpacing),
	);
	const stringIndex = Math.round(
		(point.y - metrics.padding.top) / Math.max(1, metrics.stringSpacing),
	);

	return {
		string: clamp(stringIndex, 0, metrics.stringCount - 1),
		fret: clamp(metrics.minFret + fretOffset, metrics.minFret, metrics.maxFret),
	};
}

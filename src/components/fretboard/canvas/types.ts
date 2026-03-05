import type { FretPosition } from "@/types";

export interface CanvasPadding {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

export interface CanvasLayoutConfig {
	width: number;
	height: number;
	fretRange: [number, number];
	stringCount?: number;
	padding?: Partial<CanvasPadding>;
}

export interface CanvasMetrics {
	width: number;
	height: number;
	fretRange: [number, number];
	minFret: number;
	maxFret: number;
	fretCount: number;
	stringCount: number;
	padding: CanvasPadding;
	playableWidth: number;
	playableHeight: number;
	fretSpacing: number;
	stringSpacing: number;
}

export interface CanvasPoint {
	x: number;
	y: number;
}

export interface CanvasCellBounds {
	position: FretPosition;
	x: number;
	y: number;
	width: number;
	height: number;
	center: CanvasPoint;
}

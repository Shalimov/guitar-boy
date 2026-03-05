export {
	canvasPointToNearestPosition,
	createCanvasMetrics,
	positionToCanvasPoint,
	positionToCellBounds,
} from "./geometry";
export type { DotRenderOptions, FretboardRenderOptions } from "./render";
export { drawConnectionLines, drawDots, drawFretboardSurface } from "./render";
export type {
	CanvasCellBounds,
	CanvasLayoutConfig,
	CanvasMetrics,
	CanvasPadding,
	CanvasPoint,
} from "./types";

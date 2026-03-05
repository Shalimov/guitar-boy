import { getNoteAtFret } from "@/lib/music";
import type { ConnectionLine, FretPosition, MarkedDot } from "@/types";
import { positionToCanvasPoint } from "./geometry";
import type { CanvasMetrics } from "./types";

const INLAY_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24] as const;
const MEDIUM_DOT_DIAMETER = 40;

export interface FretboardRenderOptions {
	backgroundColor?: string;
	fretColor?: string;
	stringColor?: string;
	nutColor?: string;
	inlayColor?: string;
}

export interface DotRenderOptions {
	selectedPositions?: FretPosition[];
	targetPositions?: FretPosition[];
	correctPositions?: FretPosition[];
	missedPositions?: FretPosition[];
	incorrectPositions?: FretPosition[];
	defaultDotColor?: string;
	targetOutlineColor?: string;
	labelMode?: "dot" | "note";
	/**
	 * Treat incoming dot positions as visual-only (vertically inverted) coordinates.
	 * When enabled, note-name labels are resolved from logical string indices.
	 */
	invertStringNotes?: boolean;
	/**
	 * Hide all note/dot labels. Used in test mode to prevent showing answers
	 * before submission.
	 */
	hideLabels?: boolean;
}

function getShortNoteLabel(position: FretPosition): string {
	const note = getNoteAtFret(position);
	return note.split("/")[0];
}

function hasPosition(positions: FretPosition[] | undefined, dot: FretPosition): boolean {
	if (!positions || positions.length === 0) {
		return false;
	}

	return positions.some((position) => position.string === dot.string && position.fret === dot.fret);
}

function resolveDotColor(dot: MarkedDot, options: DotRenderOptions): string {
	if (hasPosition(options.selectedPositions, dot.position)) {
		return "#7c3aed";
	}
	if (hasPosition(options.correctPositions, dot.position)) {
		return "#16a34a";
	}
	if (hasPosition(options.missedPositions, dot.position)) {
		return "#ca8a04";
	}
	if (hasPosition(options.incorrectPositions, dot.position)) {
		return "#dc2626";
	}

	return dot.color ?? options.defaultDotColor ?? "#b35d2a";
}

export function drawFretboardSurface(
	ctx: CanvasRenderingContext2D,
	metrics: CanvasMetrics,
	options: FretboardRenderOptions = {},
): void {
	const backgroundColor = options.backgroundColor ?? "#fff9ef";
	const fretColor = options.fretColor ?? "#9d8269";
	const stringColor = options.stringColor ?? "#7a6a5a";
	const nutColor = options.nutColor ?? "#5d4735";
	const inlayColor = options.inlayColor ?? "#c7a689";

	ctx.clearRect(0, 0, metrics.width, metrics.height);
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, metrics.width, metrics.height);

	for (let fretIndex = 0; fretIndex <= metrics.fretCount; fretIndex += 1) {
		const fret = metrics.minFret + fretIndex;
		const x = metrics.padding.left + fretIndex * metrics.fretSpacing;

		ctx.beginPath();
		ctx.moveTo(x, metrics.padding.top);
		ctx.lineTo(x, metrics.padding.top + metrics.playableHeight);
		ctx.lineWidth = fret === 0 ? 5 : 1.5;
		ctx.strokeStyle = fret === 0 ? nutColor : fretColor;
		ctx.stroke();
	}

	for (let stringIndex = 0; stringIndex < metrics.stringCount; stringIndex += 1) {
		const y = metrics.padding.top + stringIndex * metrics.stringSpacing;
		const stringThickness = 1 + stringIndex * 0.28;

		ctx.beginPath();
		ctx.moveTo(metrics.padding.left, y);
		ctx.lineTo(metrics.padding.left + metrics.playableWidth, y);
		ctx.lineWidth = stringThickness;
		ctx.strokeStyle = stringColor;
		ctx.stroke();
	}

	for (const markerFret of INLAY_FRETS) {
		if (markerFret < metrics.minFret || markerFret > metrics.maxFret) {
			continue;
		}
		if (markerFret === metrics.minFret) {
			continue;
		}

		const x = positionToCanvasPoint(metrics, { string: 0, fret: markerFret }).x;
		const centerY = metrics.padding.top + metrics.playableHeight / 2;
		const markerRadius = Math.max(3, Math.min(metrics.stringSpacing * 0.2, 8));

		if (markerFret % 12 === 0) {
			const offset = Math.max(8, metrics.stringSpacing * 0.85);
			ctx.beginPath();
			ctx.arc(x, centerY - offset / 2, markerRadius, 0, Math.PI * 2);
			ctx.fillStyle = inlayColor;
			ctx.fill();
			ctx.beginPath();
			ctx.arc(x, centerY + offset / 2, markerRadius, 0, Math.PI * 2);
			ctx.fillStyle = inlayColor;
			ctx.fill();
		} else {
			ctx.beginPath();
			ctx.arc(x, centerY, markerRadius, 0, Math.PI * 2);
			ctx.fillStyle = inlayColor;
			ctx.fill();
		}
	}
}

export function drawConnectionLines(
	ctx: CanvasRenderingContext2D,
	metrics: CanvasMetrics,
	lines: ConnectionLine[],
): void {
	for (const line of lines) {
		const from = positionToCanvasPoint(metrics, line.from);
		const to = positionToCanvasPoint(metrics, line.to);

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.lineWidth = 3;
		ctx.strokeStyle = line.color ?? "#4a3a2c";
		ctx.setLineDash(line.style === "dashed" ? [6, 4] : []);
		ctx.stroke();
	}

	ctx.setLineDash([]);
}

export function drawDots(
	ctx: CanvasRenderingContext2D,
	metrics: CanvasMetrics,
	dots: MarkedDot[],
	options: DotRenderOptions = {},
): void {
	for (const dot of dots) {
		const point = positionToCanvasPoint(metrics, dot.position);
		const maxSize = Math.min(metrics.stringSpacing, metrics.fretSpacing) - 4;
		const size = Math.max(20, Math.min(MEDIUM_DOT_DIAMETER, maxSize));
		const color = resolveDotColor(dot, options);
		const isTarget = hasPosition(options.targetPositions, dot.position);
		const isCircle = dot.shape === undefined || dot.shape === "circle";

		ctx.fillStyle = color;
		ctx.strokeStyle = "#fff8ef";
		ctx.lineWidth = 1.5;

		if (isCircle) {
			ctx.beginPath();
			ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
			ctx.fillStyle = "#fffdf9";
			ctx.fill();
			ctx.lineWidth = 2.5;
			ctx.strokeStyle = isTarget ? (options.targetOutlineColor ?? color) : color;
			ctx.stroke();
		} else if (dot.shape === "square") {
			ctx.beginPath();
			ctx.rect(point.x - size / 2, point.y - size / 2, size, size);
			ctx.fill();
			ctx.stroke();
		} else if (dot.shape === "diamond") {
			ctx.save();
			ctx.translate(point.x, point.y);
			ctx.rotate(Math.PI / 4);
			ctx.beginPath();
			ctx.rect(-size / 2, -size / 2, size, size);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		}

		const logicalNotePosition = options.invertStringNotes
			? {
					...dot.position,
					string: metrics.stringCount - 1 - dot.position.string,
				}
			: dot.position;
		const labelText =
			options.labelMode === "note" ? getShortNoteLabel(logicalNotePosition) : dot.label;

		if (labelText && !isTarget && !options.hideLabels) {
			ctx.fillStyle = isCircle ? color : "#1f1209";
			ctx.font = "600 11px Manrope";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(labelText, point.x, point.y);
		}

		if (!isTarget && typeof dot.order === "number" && dot.order > 0) {
			const badgeRadius = Math.max(7, Math.min(10, size * 0.24));
			const badgeX = point.x + size * 0.31;
			const badgeY = point.y - size * 0.31;

			ctx.beginPath();
			ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
			ctx.fillStyle = "#1f1209";
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#fff8ef";
			ctx.stroke();

			ctx.fillStyle = "#fff8ef";
			ctx.font = "700 10px Manrope";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(`${dot.order}`, badgeX, badgeY);
		}
	}
}

import { getNoteAtFret } from "@/lib/music";
import type { ConnectionLine, FretPosition, MarkedDot, NoteGroup } from "@/types";
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

	return dot.color ?? options.defaultDotColor ?? "#059669";
}

export function drawFretboardSurface(
	ctx: CanvasRenderingContext2D,
	metrics: CanvasMetrics,
	options: FretboardRenderOptions = {},
): void {
	const backgroundColor = options.backgroundColor ?? "#eef0eb";
	const fretColor = options.fretColor ?? "#8fa38a";
	const stringColor = options.stringColor ?? "#6a7a64";
	const nutColor = options.nutColor ?? "#4d5c48";
	const inlayColor = options.inlayColor ?? "#a8bda4";

	ctx.clearRect(0, 0, metrics.width, metrics.height);
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, metrics.width, metrics.height);

	const hasOpenStrings = metrics.minFret === 0;

	if (hasOpenStrings) {
		const nutX = metrics.padding.left;
		const firstFretX = metrics.padding.left + metrics.fretSpacing;
		const openStringAreaWidth = firstFretX - nutX;

		ctx.fillStyle = nutColor;
		ctx.globalAlpha = 0.12;
		ctx.fillRect(nutX, metrics.padding.top - 4, openStringAreaWidth, metrics.playableHeight + 8);
		ctx.globalAlpha = 1;
	}

	for (let fretIndex = 0; fretIndex <= metrics.fretCount; fretIndex += 1) {
		const fret = metrics.minFret + fretIndex;
		const x = metrics.padding.left + fretIndex * metrics.fretSpacing;

		ctx.beginPath();
		ctx.moveTo(x, metrics.padding.top);
		ctx.lineTo(x, metrics.padding.top + metrics.playableHeight);

		if (fret === 1 && hasOpenStrings) {
			ctx.lineWidth = 7;
			ctx.strokeStyle = nutColor;
			ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
			ctx.shadowBlur = 5;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 2;
		} else {
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = fretColor;
			ctx.shadowColor = "transparent";
			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
		}

		ctx.stroke();
	}

	ctx.shadowColor = "transparent";

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
		ctx.strokeStyle = line.color ?? "#2c3a28";
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

		ctx.fillStyle = "#ffffff";
		ctx.strokeStyle = isTarget ? (options.targetOutlineColor ?? color) : color;
		ctx.lineWidth = 2.5;

		if (isCircle) {
			ctx.beginPath();
			ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
			ctx.fill();
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
			ctx.fillStyle = color;
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
			ctx.fillStyle = "#1c2a14";
			ctx.fill();
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#f7f9f4";
			ctx.stroke();

			ctx.fillStyle = "#f7f9f4";
			ctx.font = "700 10px Manrope";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(`${dot.order}`, badgeX, badgeY);
		}
	}
}

function getConvexHull(points: { x: number; y: number }[]): { x: number; y: number }[] {
	if (points.length <= 2) return points;

	const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
	const cross = (
		o: { x: number; y: number },
		a: { x: number; y: number },
		b: { x: number; y: number },
	) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

	const lower: { x: number; y: number }[] = [];
	for (const p of sorted) {
		while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
			lower.pop();
		}
		lower.push(p);
	}

	const upper: { x: number; y: number }[] = [];
	for (let i = sorted.length - 1; i >= 0; i--) {
		const p = sorted[i];
		while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
			upper.pop();
		}
		upper.push(p);
	}

	upper.pop();
	lower.pop();
	return lower.concat(upper);
}

export function drawGroups(
	ctx: CanvasRenderingContext2D,
	metrics: CanvasMetrics,
	groups: NoteGroup[],
): void {
	for (const group of groups) {
		if (group.positions.length < 1) continue;

		const maxSize = Math.min(metrics.stringSpacing, metrics.fretSpacing) - 4;
		const dotSize = Math.max(20, Math.min(MEDIUM_DOT_DIAMETER, maxSize));
		const radius = dotSize / 2 + 8; // Offset amount to safely encircle the outer rim of dots

		const points = group.positions.map((pos) => {
			const visualPos = { ...pos, string: metrics.stringCount - 1 - pos.string };
			return positionToCanvasPoint(metrics, visualPos);
		});

		const hull = getConvexHull(points);

		ctx.beginPath();

		if (hull.length === 1) {
			ctx.arc(hull[0].x, hull[0].y, radius, 0, Math.PI * 2);
		} else {
			for (let i = 0; i < hull.length; i++) {
				const p = hull[i];
				const next = hull[(i + 1) % hull.length];
				const prev = hull[(i - 1 + hull.length) % hull.length];

				const dx = next.x - p.x;
				const dy = next.y - p.y;
				const len = Math.hypot(dx, dy) || 1;
				const nx = (dy / len) * radius;
				const ny = (-dx / len) * radius;

				const pdx = p.x - prev.x;
				const pdy = p.y - prev.y;
				const plen = Math.hypot(pdx, pdy) || 1;
				const pnx = (pdy / plen) * radius;
				const pny = (-pdx / plen) * radius;

				const sa = Math.atan2(pny, pnx);
				let ea = Math.atan2(ny, nx);
				if (ea < sa) {
					ea += Math.PI * 2;
				}

				ctx.arc(p.x, p.y, radius, sa, ea);
			}
			ctx.closePath();
		}

		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.lineWidth = 3;

		ctx.strokeStyle = group.color;
		ctx.stroke();
	}
}

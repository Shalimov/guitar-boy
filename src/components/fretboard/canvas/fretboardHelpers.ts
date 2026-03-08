import type { ConnectionLine, FretPosition, MarkedDot } from "@/types";

const PATTERN_DOT_COLOR = "#2850a7";

export const EMPTY_POSITIONS: FretPosition[] = [];
export const EMPTY_DOTS: MarkedDot[] = [];
export const EMPTY_LINES: ConnectionLine[] = [];

export function normalizeFretRange(range: [number, number]): [number, number] {
	return range[0] <= range[1] ? range : [range[1], range[0]];
}

export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function isSamePosition(a: FretPosition, b: FretPosition): boolean {
	return a.string === b.string && a.fret === b.fret;
}

export function positionKey(position: FretPosition): string {
	return `${position.string}:${position.fret}`;
}

export function toVisualStringIndex(stringIndex: number, stringCount: number): number {
	return stringCount - 1 - stringIndex;
}

export function toVisualPosition(position: FretPosition, stringCount: number): FretPosition {
	return {
		...position,
		string: toVisualStringIndex(position.string, stringCount),
	};
}

export function mapPositionsToVisual(
	positions: FretPosition[],
	stringCount: number,
): FretPosition[] {
	if (positions.length === 0) {
		return EMPTY_POSITIONS;
	}
	return positions.map((position) => toVisualPosition(position, stringCount));
}

export function mapLinesToVisual(lines: ConnectionLine[], stringCount: number): ConnectionLine[] {
	if (lines.length === 0) {
		return EMPTY_LINES;
	}
	return lines.map((line) => ({
		...line,
		from: toVisualPosition(line.from, stringCount),
		to: toVisualPosition(line.to, stringCount),
	}));
}

export function hasPosition(positions: FretPosition[], target: FretPosition): boolean {
	return positions.some((position) => isSamePosition(position, target));
}

export function getDotFromCollection(dots: MarkedDot[], target: FretPosition) {
	return dots.find((dot) => isSamePosition(dot.position, target));
}

export function hasConnectionLine(
	lines: ConnectionLine[],
	from: FretPosition,
	to: FretPosition,
): boolean {
	return lines.some(
		(line) =>
			(isSamePosition(line.from, from) && isSamePosition(line.to, to)) ||
			(isSamePosition(line.from, to) && isSamePosition(line.to, from)),
	);
}

export function isValidPosition(
	position: FretPosition,
	minFret: number,
	maxFret: number,
	stringCount: number,
): boolean {
	return (
		Number.isInteger(position.string) &&
		Number.isInteger(position.fret) &&
		position.string >= 0 &&
		position.string < stringCount &&
		position.fret >= minFret &&
		position.fret <= maxFret
	);
}

export function removeLinesForPosition(
	lines: ConnectionLine[],
	target: FretPosition,
): ConnectionLine[] {
	return lines.filter(
		(line) => !isSamePosition(line.from, target) && !isSamePosition(line.to, target),
	);
}

export function isSamePositionList(a: FretPosition[], b: FretPosition[]): boolean {
	if (a.length !== b.length) {
		return false;
	}
	for (let index = 0; index < a.length; index += 1) {
		if (!isSamePosition(a[index], b[index])) {
			return false;
		}
	}
	return true;
}

export function sanitizePositions(
	input: FretPosition[] | undefined,
	minFret: number,
	maxFret: number,
	stringCount: number,
): FretPosition[] {
	if (!input || input.length === 0) {
		return EMPTY_POSITIONS;
	}

	const seen = new Set<string>();
	const sanitized: FretPosition[] = [];

	for (const position of input) {
		if (!isValidPosition(position, minFret, maxFret, stringCount)) {
			continue;
		}

		const key = positionKey(position);
		if (seen.has(key)) {
			continue;
		}

		seen.add(key);
		sanitized.push(position);
	}

	return sanitized;
}

export function buildPatternDots(patternPositions: FretPosition[]): MarkedDot[] {
	if (patternPositions.length === 0) {
		return EMPTY_DOTS;
	}

	return patternPositions.map((position, index) => ({
		position,
		label: position.fret === 0 ? "O" : undefined,
		shape: "circle",
		color: PATTERN_DOT_COLOR,
		order: index + 1,
	}));
}

export function buildPatternLines(patternPositions: FretPosition[]): ConnectionLine[] {
	if (patternPositions.length < 2) {
		return EMPTY_LINES;
	}

	const lines: ConnectionLine[] = [];

	for (let index = 1; index < patternPositions.length; index += 1) {
		lines.push({
			from: patternPositions[index - 1],
			to: patternPositions[index],
			color: PATTERN_DOT_COLOR,
			style: "solid",
		});
	}

	return lines;
}

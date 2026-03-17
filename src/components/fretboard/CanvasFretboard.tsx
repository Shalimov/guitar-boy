import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, Layer, Stage } from "react-konva";
import { playFretPosition } from "@/lib/audio";
import { getNoteAtFret } from "@/lib/music";
import type {
	ConnectionLine,
	FretboardProps,
	FretboardState,
	FretPosition,
	MarkedDot,
} from "@/types";
import { createCanvasMetrics, positionToCanvasPoint } from "./canvas/geometry";
import { drawConnectionLines, drawDots, drawFretboardSurface, drawGroups } from "./canvas/render";

const DEFAULT_STRINGS = ["E", "A", "D", "G", "B", "e"] as const;
const DEFAULT_FRET_RANGE: [number, number] = [1, 15];
const CELL_WIDTH = 54;
const STRING_GAP = 46;
const PATTERN_DOT_COLOR = "#2850a7";
const EMPTY_STATE: FretboardState = { dots: [], lines: [] };
const EMPTY_DOTS: MarkedDot[] = [];
const EMPTY_LINES: ConnectionLine[] = [];
const EMPTY_POSITIONS: FretPosition[] = [];

interface InteractiveHotspot {
	key: string;
	logicalPosition: FretPosition;
	x: number;
	y: number;
}

function normalizeFretRange(range: [number, number]): [number, number] {
	return range[0] <= range[1] ? range : [range[1], range[0]];
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function isSamePosition(a: FretPosition, b: FretPosition): boolean {
	return a.string === b.string && a.fret === b.fret;
}

function positionKey(position: FretPosition): string {
	return `${position.string}:${position.fret}`;
}

function shouldHideLabels(mode: string, hasFeedback: boolean): boolean {
	return mode === "test" && !hasFeedback;
}

function toVisualStringIndex(stringIndex: number, stringCount: number): number {
	return stringCount - 1 - stringIndex;
}

function toVisualPosition(position: FretPosition, stringCount: number): FretPosition {
	return {
		...position,
		string: toVisualStringIndex(position.string, stringCount),
	};
}

function mapPositionsToVisual(positions: FretPosition[], stringCount: number): FretPosition[] {
	if (positions.length === 0) {
		return EMPTY_POSITIONS;
	}

	return positions.map((position) => toVisualPosition(position, stringCount));
}

function mapLinesToVisual(lines: ConnectionLine[], stringCount: number): ConnectionLine[] {
	if (lines.length === 0) {
		return EMPTY_LINES;
	}

	return lines.map((line) => ({
		...line,
		from: toVisualPosition(line.from, stringCount),
		to: toVisualPosition(line.to, stringCount),
	}));
}

function hasPosition(positions: FretPosition[], target: FretPosition): boolean {
	return positions.some((position) => isSamePosition(position, target));
}

function getDotAtPosition(state: FretboardState, target: FretPosition) {
	return state.dots.find((dot) => isSamePosition(dot.position, target));
}

function getDotFromCollection(dots: MarkedDot[], target: FretPosition) {
	return dots.find((dot) => isSamePosition(dot.position, target));
}

function hasConnectionLine(lines: ConnectionLine[], from: FretPosition, to: FretPosition): boolean {
	return lines.some(
		(line) =>
			(isSamePosition(line.from, from) && isSamePosition(line.to, to)) ||
			(isSamePosition(line.from, to) && isSamePosition(line.to, from)),
	);
}

function isValidPosition(
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

function removeLinesForPosition(lines: ConnectionLine[], target: FretPosition): ConnectionLine[] {
	return lines.filter(
		(line) => !isSamePosition(line.from, target) && !isSamePosition(line.to, target),
	);
}

function isSamePositionList(a: FretPosition[], b: FretPosition[]): boolean {
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

function sanitizePositions(
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

function buildPatternDots(patternPositions: FretPosition[]): MarkedDot[] {
	if (patternPositions.length === 0) {
		return EMPTY_DOTS;
	}

	return patternPositions.map((position, index) => ({
		position,
		label: getNoteAtFret(position),
		shape: "circle",
		color: PATTERN_DOT_COLOR,
		order: index + 1,
	}));
}

function buildPatternLines(patternPositions: FretPosition[]): ConnectionLine[] {
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

function mergeDots(base: MarkedDot[], overlay: MarkedDot[]): MarkedDot[] {
	if (overlay.length === 0) {
		return base;
	}

	const merged = new Map<string, MarkedDot>();

	for (const dot of base) {
		merged.set(positionKey(dot.position), dot);
	}

	for (const dot of overlay) {
		merged.set(positionKey(dot.position), dot);
	}

	return Array.from(merged.values());
}

function mergeLines(base: ConnectionLine[], overlay: ConnectionLine[]): ConnectionLine[] {
	if (overlay.length === 0) {
		return base;
	}

	const merged = [...base];

	for (const line of overlay) {
		if (!hasConnectionLine(merged, line.from, line.to)) {
			merged.push(line);
		}
	}

	return merged;
}

function sanitizeState(
	input: FretboardState | undefined,
	minFret: number,
	maxFret: number,
	stringCount: number,
): FretboardState {
	if (!input) {
		return EMPTY_STATE;
	}

	const dotKeys = new Set<string>();
	const dots = input.dots.filter((dot) => {
		if (!isValidPosition(dot.position, minFret, maxFret, stringCount)) {
			return false;
		}

		const key = positionKey(dot.position);
		if (dotKeys.has(key)) {
			return false;
		}

		dotKeys.add(key);
		return true;
	});

	const lines = input.lines.filter(
		(line) =>
			isValidPosition(line.from, minFret, maxFret, stringCount) &&
			isValidPosition(line.to, minFret, maxFret, stringCount),
	);

	const groups = input.groups
		?.map((group) => ({
			...group,
			positions: group.positions.filter((pos) =>
				isValidPosition(pos, minFret, maxFret, stringCount),
			),
		}))
		.filter((group) => group.positions.length > 0);

	return { dots, lines, groups };
}

function buildCellLabel(options: {
	position: FretPosition;
	stringLabel: string;
	noteName: string;
	dotLabel?: string;
	isTarget: boolean;
	patternOrder?: number;
	isSelected: boolean;
	isCorrect: boolean;
	isMissed: boolean;
	isIncorrect: boolean;
}): string {
	const label = [
		`String ${options.position.string + 1} (${options.stringLabel})`,
		`Fret ${options.position.fret}`,
		`Note ${options.noteName}`,
	];

	if (options.dotLabel) {
		label.push(`Marker ${options.dotLabel}`);
	}
	if (options.isTarget) {
		label.push("Target");
	}
	if (options.patternOrder !== undefined) {
		label.push(`Pattern order ${options.patternOrder}`);
	}
	if (options.isSelected) {
		label.push("Selected");
	}
	if (options.isCorrect) {
		label.push("Correct");
	}
	if (options.isMissed) {
		label.push("Missed");
	}
	if (options.isIncorrect) {
		label.push("Incorrect");
	}

	return label.join(", ");
}

export function CanvasFretboard({
	fretRange = DEFAULT_FRET_RANGE,
	strings = [...DEFAULT_STRINGS],
	showFretNumbers = true,
	showStringLabels = true,
	showNoteNames = true,
	showIntervalLabels = false,
	state,
	mode,
	onFretClick,
	onFretContextMenu,
	onLineDrawn,
	playAudioOnFretClick = false,
	onFretHoverChange,
	ariaLabel,
	selectedPositions,
	targetPositions,
	correctPositions,
	missedPositions,
	incorrectPositions,
}: FretboardProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});
	const pointerLineStartRef = useRef<FretPosition | null>(null);
	const suppressNextClickRef = useRef(false);
	const [containerWidth, setContainerWidth] = useState(0);
	const [internalState, setInternalState] = useState<FretboardState>(() => state ?? EMPTY_STATE);
	const [internalPatternPositions, setInternalPatternPositions] =
		useState<FretPosition[]>(EMPTY_POSITIONS);
	const [activePosition, setActivePosition] = useState<FretPosition>({
		string: 0,
		fret: DEFAULT_FRET_RANGE[0],
	});

	const resolvedSelectedPositions = selectedPositions ?? EMPTY_POSITIONS;
	const resolvedTargetPositions = targetPositions ?? EMPTY_POSITIONS;
	const resolvedCorrectPositions = correctPositions ?? EMPTY_POSITIONS;
	const resolvedMissedPositions = missedPositions ?? EMPTY_POSITIONS;
	const resolvedIncorrectPositions = incorrectPositions ?? EMPTY_POSITIONS;

	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setContainerWidth(entry.contentRect.width);
			}
		});
		observer.observe(element);
		setContainerWidth(element.clientWidth);
		return () => observer.disconnect();
	}, []);

	const safeStrings = strings.length === DEFAULT_STRINGS.length ? strings : [...DEFAULT_STRINGS];
	const stringCount = safeStrings.length;
	const isControlled = state !== undefined;
	const [rawMinFret, rawMaxFret] = normalizeFretRange(fretRange);
	const minFret = Math.max(0, rawMinFret);
	const maxFret = Math.max(minFret, rawMaxFret);
	const fretCount = maxFret - minFret + 1;
	const resolvedAriaLabel = ariaLabel ?? "Guitar fretboard";

	const currentState = useMemo(
		() => sanitizeState(isControlled ? state : internalState, minFret, maxFret, stringCount),
		[isControlled, state, internalState, minFret, maxFret, stringCount],
	);

	useEffect(() => {
		if (!isControlled) {
			return;
		}

		setInternalState(state ?? EMPTY_STATE);
	}, [isControlled, state]);

	useEffect(() => {
		setActivePosition((previous) => ({
			string: clamp(previous.string, 0, stringCount - 1),
			fret: clamp(previous.fret, minFret, maxFret),
		}));
	}, [stringCount, minFret, maxFret]);

	useEffect(() => {
		if (selectedPositions !== undefined) {
			return;
		}

		setInternalPatternPositions((previous) => {
			const sanitized = sanitizePositions(previous, minFret, maxFret, stringCount);
			return isSamePositionList(previous, sanitized) ? previous : sanitized;
		});
	}, [selectedPositions, minFret, maxFret, stringCount]);

	const patternPositions = useMemo(() => {
		if (mode !== "patterns") {
			return EMPTY_POSITIONS;
		}

		const source =
			selectedPositions !== undefined ? resolvedSelectedPositions : internalPatternPositions;
		return sanitizePositions(source, minFret, maxFret, stringCount);
	}, [
		mode,
		selectedPositions,
		resolvedSelectedPositions,
		internalPatternPositions,
		minFret,
		maxFret,
		stringCount,
	]);

	const feedbackPositions = useMemo(
		() =>
			sanitizePositions(
				[
					...resolvedSelectedPositions,
					...resolvedCorrectPositions,
					...resolvedMissedPositions,
					...resolvedIncorrectPositions,
				],
				minFret,
				maxFret,
				stringCount,
			),
		[
			resolvedSelectedPositions,
			resolvedCorrectPositions,
			resolvedMissedPositions,
			resolvedIncorrectPositions,
			minFret,
			maxFret,
			stringCount,
		],
	);

	const targetDots = useMemo(
		() =>
			sanitizePositions(resolvedTargetPositions, minFret, maxFret, stringCount).map((position) => ({
				position,
				shape: "circle" as const,
			})),
		[resolvedTargetPositions, minFret, maxFret, stringCount],
	);

	const feedbackDots = useMemo(
		() =>
			feedbackPositions.map((position) => ({
				position,
				shape: "circle" as const,
				label: getNoteAtFret(position),
			})),
		[feedbackPositions],
	);

	const patternDots = useMemo(() => buildPatternDots(patternPositions), [patternPositions]);
	const patternLines = useMemo(() => buildPatternLines(patternPositions), [patternPositions]);

	const stateDots = useMemo(() => {
		if (mode !== "patterns") {
			return currentState.dots;
		}

		return currentState.dots.map((dot) => ({
			...dot,
			label: dot.label ?? getNoteAtFret(dot.position),
		}));
	}, [mode, currentState.dots]);

	const hasFeedback =
		resolvedCorrectPositions.length > 0 ||
		resolvedMissedPositions.length > 0 ||
		resolvedIncorrectPositions.length > 0;

	const renderedDots = useMemo(() => {
		let dots = stateDots;

		if (mode !== "draw") {
			dots = mergeDots(dots, feedbackDots);
		}

		if (mode === "patterns") {
			dots = mergeDots(dots, patternDots);
		}
		if (mode === "test" && hasFeedback) {
			dots = mergeDots(dots, targetDots);
		}

		return dots;
	}, [stateDots, feedbackDots, mode, patternDots, targetDots, hasFeedback]);

	const renderedLines = useMemo(() => {
		if (mode !== "patterns") {
			return currentState.lines;
		}

		return mergeLines(currentState.lines, patternLines);
	}, [mode, currentState.lines, patternLines]);

	const patternOrderByKey = useMemo(() => {
		const map = new Map<string, number>();

		for (const dot of patternDots) {
			if (dot.order !== undefined) {
				map.set(positionKey(dot.position), dot.order);
			}
		}

		return map;
	}, [patternDots]);

	const fretNumbers = useMemo(
		() => Array.from({ length: fretCount }, (_, index) => index + minFret),
		[fretCount, minFret],
	);
	const baseCanvasWidth = Math.max(360, 72 + fretCount * CELL_WIDTH);
	// Reserve space for string labels (~20px) + gap (12px) when shown
	const labelsGutter = showStringLabels ? 32 : 0;
	const availableCanvasWidth = containerWidth > 0 ? containerWidth - labelsGutter : 0;
	const canvasWidth = Math.max(baseCanvasWidth, availableCanvasWidth);
	// Extra vertical padding so dots and group outlines on the outermost strings aren't clipped.
	// Max dot radius = MEDIUM_DOT_DIAMETER / 2 = 20; group stroke adds ~8px beyond that → 30px safe.
	const VERTICAL_PAD = 30;
	const canvasHeight = Math.max(220, VERTICAL_PAD * 2 + Math.max(1, stringCount - 1) * STRING_GAP);
	const canvasMetrics = useMemo(
		() =>
			createCanvasMetrics({
				width: canvasWidth,
				height: canvasHeight,
				fretRange: [minFret, maxFret],
				stringCount,
				padding: {
					top: VERTICAL_PAD,
					right: 24,
					bottom: VERTICAL_PAD,
					left: 24,
				},
			}),
		[canvasWidth, canvasHeight, minFret, maxFret, stringCount],
	);
	const interactionFrame = useMemo(
		() => ({
			left: canvasMetrics.padding.left,
			top: canvasMetrics.padding.top - canvasMetrics.stringSpacing / 2,
			width: canvasMetrics.playableWidth,
			height: canvasMetrics.stringSpacing * stringCount,
		}),
		[canvasMetrics, stringCount],
	);
	const interactionRadius = useMemo(() => {
		if (mode === "view") {
			return 0;
		}

		const baseRadius = 14;

		return Math.max(
			baseRadius,
			Math.min(canvasMetrics.fretSpacing, canvasMetrics.stringSpacing) * 0.4,
		);
	}, [mode, canvasMetrics]);

	const interactiveHotspots = useMemo(() => {
		if (mode === "view") {
			return [];
		}

		const hotspots: InteractiveHotspot[] = [];

		for (let stringIndex = 0; stringIndex < stringCount; stringIndex += 1) {
			for (const fret of fretNumbers) {
				const logicalPosition = { string: stringIndex, fret };
				const visualPosition = toVisualPosition(logicalPosition, stringCount);
				const point = positionToCanvasPoint(canvasMetrics, visualPosition);

				hotspots.push({
					key: positionKey(logicalPosition),
					logicalPosition,
					x: point.x,
					y: point.y,
				});
			}
		}

		return hotspots;
	}, [mode, stringCount, fretNumbers, canvasMetrics]);
	const stringRows = useMemo(() => {
		const occurrences = new Map<string, number>();

		return Array.from({ length: stringCount }, (_, visualIndex) => {
			const stringIndex = toVisualStringIndex(visualIndex, stringCount);
			const stringLabel = safeStrings[stringIndex];
			const count = (occurrences.get(stringLabel) ?? 0) + 1;
			occurrences.set(stringLabel, count);

			return {
				stringLabel,
				stringIndex,
				rowKey: count === 1 ? stringLabel : `${stringLabel}-${count}`,
			};
		});
	}, [safeStrings, stringCount]);
	const renderedDotsForCanvas = useMemo(
		() =>
			renderedDots.map((dot) => ({
				...dot,
				position: toVisualPosition(dot.position, stringCount),
			})),
		[renderedDots, stringCount],
	);
	const renderedLinesForCanvas = useMemo(
		() => mapLinesToVisual(renderedLines, stringCount),
		[renderedLines, stringCount],
	);
	const selectedPositionsForCanvas = useMemo(
		() => mapPositionsToVisual(resolvedSelectedPositions, stringCount),
		[resolvedSelectedPositions, stringCount],
	);
	const targetPositionsForCanvas = useMemo(
		() => mapPositionsToVisual(resolvedTargetPositions, stringCount),
		[resolvedTargetPositions, stringCount],
	);
	const correctPositionsForCanvas = useMemo(
		() => mapPositionsToVisual(resolvedCorrectPositions, stringCount),
		[resolvedCorrectPositions, stringCount],
	);
	const missedPositionsForCanvas = useMemo(
		() => mapPositionsToVisual(resolvedMissedPositions, stringCount),
		[resolvedMissedPositions, stringCount],
	);
	const incorrectPositionsForCanvas = useMemo(
		() => mapPositionsToVisual(resolvedIncorrectPositions, stringCount),
		[resolvedIncorrectPositions, stringCount],
	);
	const updateInternalState = useCallback(
		(updater: (state: FretboardState) => FretboardState) => {
			if (isControlled) {
				return;
			}

			setInternalState((previousState) => {
				const normalized = sanitizeState(previousState, minFret, maxFret, stringCount);
				return updater(normalized);
			});
		},
		[isControlled, minFret, maxFret, stringCount],
	);

	const focusCell = useCallback((position: FretPosition) => {
		const key = positionKey(position);
		const target = cellRefs.current[key];
		if (target) {
			target.focus();
		}
	}, []);

	const applyPositionAction = useCallback(
		(position: FretPosition) => {
			setActivePosition(position);

			if (
				playAudioOnFretClick &&
				(mode !== "view" || getDotFromCollection(renderedDots, position))
			) {
				void playFretPosition(position);
			}

			if (mode === "view") {
				return;
			}

			onFretClick?.(position);

			if (mode === "patterns") {
				if (selectedPositions !== undefined) {
					return;
				}

				setInternalPatternPositions((previous) => {
					if (hasPosition(previous, position)) {
						return previous.filter((current) => !isSamePosition(current, position));
					}

					const previousPosition = previous[previous.length - 1];
					if (previousPosition && !isSamePosition(previousPosition, position)) {
						onLineDrawn?.(previousPosition, position);
					}

					return [...previous, position];
				});
				return;
			}

			if (mode !== "draw") {
				return;
			}

			updateInternalState((previousState) => {
				const hasDot = getDotAtPosition(previousState, position);

				if (hasDot) {
					return {
						...previousState,
						dots: previousState.dots.filter((dot) => !isSamePosition(dot.position, position)),
						lines: removeLinesForPosition(previousState.lines, position),
					};
				}

				return {
					...previousState,
					dots: [...previousState.dots, { position }],
				};
			});
		},
		[
			mode,
			onFretClick,
			onLineDrawn,
			playAudioOnFretClick,
			renderedDots,
			selectedPositions,
			updateInternalState,
		],
	);

	const commitLine = useCallback(
		(from: FretPosition, to: FretPosition) => {
			if (isSamePosition(from, to)) {
				return;
			}

			onLineDrawn?.(from, to);

			updateInternalState((previousState) => {
				if (
					!getDotAtPosition(previousState, from) ||
					!getDotAtPosition(previousState, to) ||
					hasConnectionLine(previousState.lines, from, to)
				) {
					return previousState;
				}

				return {
					...previousState,
					lines: [...previousState.lines, { from, to }],
				};
			});
		},
		[onLineDrawn, updateInternalState],
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const context = canvas.getContext("2d");
		if (!context) {
			return;
		}

		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.round(canvasWidth * dpr);
		canvas.height = Math.round(canvasHeight * dpr);
		canvas.style.width = `${canvasWidth}px`;
		canvas.style.height = `${canvasHeight}px`;
		context.setTransform(dpr, 0, 0, dpr, 0, 0);

		drawFretboardSurface(context, canvasMetrics);

		if (currentState.groups && currentState.groups.length > 0) {
			drawGroups(context, canvasMetrics, currentState.groups);
		}

		drawConnectionLines(context, canvasMetrics, renderedLinesForCanvas);

		const hasFeedback =
			(correctPositions?.length ?? 0) > 0 ||
			(missedPositions?.length ?? 0) > 0 ||
			(incorrectPositions?.length ?? 0) > 0;

		const hideLabels = shouldHideLabels(mode, hasFeedback);

		drawDots(context, canvasMetrics, renderedDotsForCanvas, {
			selectedPositions: selectedPositionsForCanvas,
			targetPositions: targetPositionsForCanvas,
			correctPositions: correctPositionsForCanvas,
			missedPositions: missedPositionsForCanvas,
			incorrectPositions: incorrectPositionsForCanvas,
			labelMode: showNoteNames ? "note" : showIntervalLabels ? "dot" : "dot",
			invertStringNotes: true,
			hideLabels,
		});
	}, [
		canvasWidth,
		canvasHeight,
		canvasMetrics,
		renderedLinesForCanvas,
		renderedDotsForCanvas,
		selectedPositionsForCanvas,
		targetPositionsForCanvas,
		correctPositionsForCanvas,
		missedPositionsForCanvas,
		incorrectPositionsForCanvas,
		showNoteNames,
		showIntervalLabels,
		mode,
		correctPositions,
		missedPositions,
		incorrectPositions,
		currentState.groups,
	]);

	const handleCellClick = useCallback(
		(position: FretPosition) => {
			if (suppressNextClickRef.current) {
				suppressNextClickRef.current = false;
				return;
			}

			applyPositionAction(position);
		},
		[applyPositionAction],
	);

	const handleCellHover = useCallback(
		(position: FretPosition | null) => {
			onFretHoverChange?.(position);
		},
		[onFretHoverChange],
	);

	const handleCellContextMenu = useCallback(
		(
			event: {
				preventDefault: () => void;
				stopPropagation: () => void;
				clientX: number;
				clientY: number;
			},
			position: FretPosition,
		) => {
			event.preventDefault();
			event.stopPropagation();
			suppressNextClickRef.current = true;
			requestAnimationFrame(() => {
				suppressNextClickRef.current = false;
			});

			if (mode === "view") {
				return;
			}

			setActivePosition(position);
			onFretContextMenu?.(position, { x: event.clientX, y: event.clientY });
		},
		[mode, onFretContextMenu],
	);

	const handleCellPointerDown = useCallback(
		(position: FretPosition) => {
			if (mode !== "draw") {
				return;
			}

			pointerLineStartRef.current = getDotAtPosition(currentState, position) ? position : null;
		},
		[mode, currentState],
	);

	const handleCellPointerUp = useCallback(
		(position: FretPosition) => {
			if (mode !== "draw") {
				return;
			}

			const lineStart = pointerLineStartRef.current;
			pointerLineStartRef.current = null;

			if (
				!lineStart ||
				!getDotAtPosition(currentState, position) ||
				isSamePosition(lineStart, position)
			) {
				return;
			}

			commitLine(lineStart, position);
			suppressNextClickRef.current = true;
		},
		[mode, currentState, commitLine],
	);

	const moveActivePosition = useCallback(
		(deltaString: number, deltaFret: number) => {
			setActivePosition((previous) => {
				const nextPosition = {
					string: clamp(previous.string + deltaString, 0, stringCount - 1),
					fret: clamp(previous.fret + deltaFret, minFret, maxFret),
				};

				requestAnimationFrame(() => {
					focusCell(nextPosition);
				});

				return nextPosition;
			});
		},
		[stringCount, minFret, maxFret, focusCell],
	);

	const handleCellKeyDown = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>, position: FretPosition) => {
			switch (event.key) {
				case "ArrowLeft":
					event.preventDefault();
					moveActivePosition(0, -1);
					return;
				case "ArrowRight":
					event.preventDefault();
					moveActivePosition(0, 1);
					return;
				case "ArrowUp":
					event.preventDefault();
					moveActivePosition(1, 0);
					return;
				case "ArrowDown":
					event.preventDefault();
					moveActivePosition(-1, 0);
					return;
				case "Enter":
				case " ":
					event.preventDefault();
					applyPositionAction(position);
					return;
				default:
					return;
			}
		},
		[moveActivePosition, applyPositionAction],
	);

	useEffect(() => {
		return () => {
			onFretHoverChange?.(null);
		};
	}, [onFretHoverChange]);

	return (
		<div ref={containerRef} className="max-w-full overflow-x-auto pb-4">
			<div className="inline-flex items-start gap-3">
				{showStringLabels && (
					<div
						className="grid text-right text-xs text-[var(--gb-text-muted)]"
						style={{
							height: canvasHeight,
							gridTemplateRows: `repeat(${stringCount}, minmax(0, 1fr))`,
						}}
					>
						{stringRows.map(({ rowKey, stringLabel }) => (
							<div
								key={`string-label-${rowKey}`}
								className="flex items-center justify-end pr-1 font-medium"
							>
								{stringLabel}
							</div>
						))}
					</div>
				)}

				<div>
					<div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
						<canvas
							ref={canvasRef}
							role="img"
							aria-label={resolvedAriaLabel}
							className="rounded-[14px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] shadow-[var(--gb-shadow-soft)]"
						/>

						<div className="absolute inset-0 z-20">
							<Stage
								width={canvasWidth}
								height={canvasHeight}
								style={{ pointerEvents: mode === "view" ? "none" : "auto" }}
							>
								<Layer>
									{interactiveHotspots.map((hotspot) => (
										<Circle
											key={`hotspot-${hotspot.key}`}
											x={hotspot.x}
											y={hotspot.y}
											radius={interactionRadius}
											fill="rgba(0,0,0,0.01)"
											onMouseDown={() => handleCellPointerDown(hotspot.logicalPosition)}
											onMouseUp={() => handleCellPointerUp(hotspot.logicalPosition)}
											onMouseEnter={() => handleCellHover(hotspot.logicalPosition)}
											onMouseLeave={() => handleCellHover(null)}
											onContextMenu={(event) =>
												handleCellContextMenu(event.evt, hotspot.logicalPosition)
											}
											onTouchStart={() => handleCellPointerDown(hotspot.logicalPosition)}
											onTouchEnd={() => handleCellPointerUp(hotspot.logicalPosition)}
											onClick={() => handleCellClick(hotspot.logicalPosition)}
										/>
									))}
								</Layer>
							</Stage>
						</div>

						<table
							aria-label={`${resolvedAriaLabel} grid`}
							className="absolute z-10 table-fixed border-collapse"
							style={{
								left: interactionFrame.left,
								top: interactionFrame.top,
								width: interactionFrame.width,
								height: interactionFrame.height,
							}}
						>
							<tbody>
								{stringRows.map(({ stringLabel, stringIndex, rowKey }) => (
									<tr key={`row-${rowKey}`}>
										{fretNumbers.map((fret) => {
											const position = { string: stringIndex, fret };
											const key = positionKey(position);
											const isActiveCell = isSamePosition(activePosition, position);
											const noteName = getNoteAtFret(position);
											const dot = getDotFromCollection(renderedDots, position);
											const isTarget = hasPosition(resolvedTargetPositions, position);
											const patternOrder = patternOrderByKey.get(key);
											const isSelected = hasPosition(resolvedSelectedPositions, position);
											const isCorrect = hasPosition(resolvedCorrectPositions, position);
											const isMissed = hasPosition(resolvedMissedPositions, position);
											const isIncorrect = hasPosition(resolvedIncorrectPositions, position);
											const ariaCellLabel = buildCellLabel({
												position,
												stringLabel,
												noteName,
												dotLabel: dot?.label,
												isTarget,
												patternOrder,
												isSelected,
												isCorrect,
												isMissed,
												isIncorrect,
											});

											return (
												<td key={key} className="p-0">
													<button
														ref={(element) => {
															cellRefs.current[key] = element;
														}}
														type="button"
														data-position={key}
														tabIndex={isActiveCell ? 0 : -1}
														aria-label={ariaCellLabel}
														onFocus={() => setActivePosition(position)}
														onMouseEnter={() => handleCellHover(position)}
														onMouseLeave={() => handleCellHover(null)}
														onBlur={() => handleCellHover(null)}
														onKeyDown={(event) => handleCellKeyDown(event, position)}
														onContextMenu={(event) => handleCellContextMenu(event, position)}
														onPointerDown={() => handleCellPointerDown(position)}
														onPointerUp={() => handleCellPointerUp(position)}
														onClick={() => handleCellClick(position)}
														className={`h-full w-full rounded-[8px] border border-transparent bg-transparent text-[0px] focus-visible:border-[var(--gb-accent)] focus-visible:bg-[rgba(179,93,42,0.2)] focus-visible:outline-none ${
															mode === "view" ? "cursor-default" : "cursor-pointer"
														}`}
													>
														{key}
													</button>
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{showFretNumbers && (
						<div
							className="mt-2 grid text-center text-xs text-[var(--gb-text-muted)]"
							style={{
								marginLeft: canvasMetrics.padding.left,
								width: canvasMetrics.playableWidth,
								gridTemplateColumns: `repeat(${fretNumbers.length}, minmax(0, 1fr))`,
							}}
						>
							{fretNumbers.map((fret) => (
								<div key={`fret-${fret}`}>{fret}</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

import type { ConnectionLine, FretboardState, FretPosition, MarkedDot, NoteGroup } from "@/types";

export function createDot(
	position: FretPosition,
	options?: {
		label?: string;
		color?: string;
		shape?: "circle" | "square" | "diamond";
	},
): MarkedDot {
	return {
		position,
		label: options?.label,
		color: options?.color ?? "#3B82F6",
		shape: options?.shape ?? "circle",
	};
}

export function createGroup(positions: FretPosition[], color: string): NoteGroup {
	return {
		id: crypto.randomUUID(),
		positions,
		color,
		strokeWidth: 2,
		fillOpacity: 0.2,
	};
}

export function isSamePosition(a: FretPosition, b: FretPosition): boolean {
	return a.string === b.string && a.fret === b.fret;
}

export function findDotIndex(dots: MarkedDot[], position: FretPosition): number {
	return dots.findIndex((d) => isSamePosition(d.position, position));
}

export function hasDotAt(dots: MarkedDot[], position: FretPosition): boolean {
	return dots.some((d) => isSamePosition(d.position, position));
}

export function removeLinesForPosition(
	lines: ConnectionLine[],
	position: FretPosition,
): ConnectionLine[] {
	return lines.filter(
		(line) => !isSamePosition(line.from, position) && !isSamePosition(line.to, position),
	);
}

export function removeDotAt(state: FretboardState, position: FretPosition): FretboardState {
	const dotIndex = findDotIndex(state.dots, position);
	if (dotIndex < 0) return state;

	return {
		...state,
		dots: state.dots.filter((_, i) => i !== dotIndex),
		lines: removeLinesForPosition(state.lines, position),
		groups: (state.groups ?? [])
			.map((g) => ({
				...g,
				positions: g.positions.filter((p) => !isSamePosition(p, position)),
			}))
			.filter((g) => g.positions.length > 0),
	};
}

export function addDot(state: FretboardState, dot: MarkedDot): FretboardState {
	return {
		...state,
		dots: [...state.dots, dot],
		groups: state.groups ?? [],
	};
}

export function addGroup(state: FretboardState, group: NoteGroup): FretboardState {
	return {
		...state,
		groups: [...(state.groups ?? []), group],
	};
}

export function clearDiagram(): FretboardState {
	return { dots: [], lines: [], groups: [] };
}

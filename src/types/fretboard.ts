import type { FretPosition } from "./music";

export interface MarkedDot {
	position: FretPosition;
	label?: string;
	color?: string;
	shape?: "circle" | "square" | "diamond";
	order?: number;
}

export interface ConnectionLine {
	from: FretPosition;
	to: FretPosition;
	style?: "solid" | "dashed";
	color?: string;
}

export interface NoteGroup {
	id: string;
	positions: FretPosition[];
	color: string;
	strokeWidth: number;
	fillOpacity?: number;
	label?: string;
}

export interface FretboardState {
	dots: MarkedDot[];
	lines: ConnectionLine[];
	groups?: NoteGroup[];
	highlightStrings?: number[];
	highlightFrets?: number[];
}

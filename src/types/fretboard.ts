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

export interface FretboardState {
	dots: MarkedDot[];
	lines: ConnectionLine[];
	highlightStrings?: number[];
	highlightFrets?: number[];
}

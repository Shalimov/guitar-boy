import type { FretboardState } from "./fretboard";
import type { FretPosition } from "./music";

/** Saved fretboard annotation created by user */
export interface Diagram {
	/** UUID v4 */
	id: string;
	/** User-defined name */
	name: string;
	/** Optional notes */
	description?: string;
	/** ISO timestamp */
	createdAt: string;
	/** ISO timestamp */
	updatedAt: string;
	fretboardState: FretboardState;
	/** true = shipped with app, immutable */
	isBuiltIn: boolean;
}

/** Fretboard interaction modes */
export type FretboardMode = "view" | "click-select" | "draw" | "test" | "patterns";

/** Props for Fretboard component */
export interface FretboardProps {
	/** Fret range [min, max], default [1, 15] */
	fretRange?: [number, number];
	/** String notes, default ['E','A','D','G','B','e'] */
	strings?: string[];
	/** Show fret numbers below the board, default true */
	showFretNumbers?: boolean;
	/** Show string name labels at the left side, default true */
	showStringLabels?: boolean;
	/** Show note names on dots, default true */
	showNoteNames?: boolean;
	/** Show interval labels on dots, default false */
	showIntervalLabels?: boolean;
	/** Dots + lines to render */
	state?: FretboardState;
	/** Interaction mode */
	mode: FretboardMode;
	/** Callback when fret clicked in interactive modes */
	onFretClick?: (pos: FretPosition) => void;
	/** Callback when a fret is right-clicked in interactive modes */
	onFretContextMenu?: (pos: FretPosition, location: { x: number; y: number }) => void;
	/** Callback when a connection line is formed (draw/patterns modes) */
	onLineDrawn?: (from: FretPosition, to: FretPosition) => void;
	/** Controlled selection (also used as ordered pattern points in patterns mode) */
	selectedPositions?: FretPosition[];
	/** Target positions shown as empty circles in test mode */
	targetPositions?: FretPosition[];
	/** Feedback overlay - green */
	correctPositions?: FretPosition[];
	/** Feedback overlay - yellow */
	missedPositions?: FretPosition[];
	/** Feedback overlay - red */
	incorrectPositions?: FretPosition[];
	/** Accessibility label */
	ariaLabel?: string;
}

import {
	ARPEGGIO_FORMULAS,
	CHORD_FORMULAS,
	getAllPositionsOfNote,
	getConstructNotes,
	getDisplayNoteName,
	getIntervalFormulaToken,
	INTERVAL_FORMULAS,
	SCALE_FORMULAS,
} from "@/lib/music";
import type { FretboardState, IntervalFormulaToken, NoteGroup, NoteName } from "@/types";

export type ExplorerConstructType = "Scales" | "Chords" | "Arpeggios" | "Single Intervals";
export type ExplorerLabelType = "notes" | "intervals";
export type ExplorerCagedShape = "C" | "A" | "G" | "E" | "D";
export type ExplorerNoteFilter = "all" | NoteName;

export interface ExplorerState {
	root: NoteName;
	constructType: ExplorerConstructType;
	constructName: string;
	labelType: ExplorerLabelType;
	noteFilter: ExplorerNoteFilter;
	accidentalPreference: "sharp" | "flat";
	fretRange: [number, number];
	showCagedOverlay: boolean;
	activeCagedShapes: ExplorerCagedShape[];
}

const ROOT_COLOR = "#c46b2d";
const TONE_COLOR = "#1e5c85";
const INTERVAL_COLOR = "#8d4d25";
const CAGED_COLORS: Record<ExplorerCagedShape, string> = {
	C: "#8c5c34",
	A: "#c46b2d",
	G: "#306f8b",
	E: "#4e7c3d",
	D: "#8b4c62",
};

const CAGED_WINDOWS: Record<ExplorerCagedShape, { startOffset: number; width: number }> = {
	C: { startOffset: -2, width: 5 },
	A: { startOffset: 0, width: 4 },
	G: { startOffset: -1, width: 5 },
	E: { startOffset: 0, width: 4 },
	D: { startOffset: 2, width: 4 },
};

export const EXPLORER_CONSTRUCT_OPTIONS: Record<ExplorerConstructType, string[]> = {
	Scales: Object.keys(SCALE_FORMULAS),
	Chords: Object.keys(CHORD_FORMULAS),
	Arpeggios: Object.keys(ARPEGGIO_FORMULAS),
	"Single Intervals": Object.keys(INTERVAL_FORMULAS),
};

function getFormula(state: ExplorerState): IntervalFormulaToken[] {
	switch (state.constructType) {
		case "Scales":
			return SCALE_FORMULAS[state.constructName] ?? SCALE_FORMULAS.Major;
		case "Chords":
			return CHORD_FORMULAS[state.constructName] ?? CHORD_FORMULAS.Major;
		case "Arpeggios":
			return ARPEGGIO_FORMULAS[state.constructName] ?? ARPEGGIO_FORMULAS.Major;
		case "Single Intervals":
			return INTERVAL_FORMULAS[state.constructName] ?? INTERVAL_FORMULAS["Perfect 5th"];
	}
}

export function getExplorerConstructFormula(state: ExplorerState): IntervalFormulaToken[] {
	return getFormula(state);
}

export function buildExplorerFretboardState(state: ExplorerState): FretboardState {
	const formula = getFormula(state);
	const noteSet = Array.from(new Set(getConstructNotes(state.root, formula)));
	const visibleNotes =
		state.noteFilter === "all" ? noteSet : noteSet.filter((note) => note === state.noteFilter);
	const formulaByNote = new Map<NoteName, IntervalFormulaToken>();

	for (const note of noteSet) {
		if (!formulaByNote.has(note)) {
			formulaByNote.set(note, getIntervalFormulaToken(state.root, note));
		}
	}

	const dots = visibleNotes.flatMap((note) =>
		getAllPositionsOfNote(note, state.fretRange).map((position) => {
			const interval = formulaByNote.get(note) ?? "1";
			const isRoot = interval === "1" || interval === "8";

			return {
				position,
				label:
					state.labelType === "intervals"
						? interval
						: getDisplayNoteName(note, state.accidentalPreference),
				color: isRoot ? ROOT_COLOR : state.labelType === "intervals" ? INTERVAL_COLOR : TONE_COLOR,
				shape: isRoot ? ("square" as const) : ("circle" as const),
			};
		}),
	);

	const groups = state.showCagedOverlay ? buildCagedGroups(state, visibleNotes) : undefined;

	return { dots, lines: [], groups };
}

function buildCagedGroups(state: ExplorerState, notes: NoteName[]): NoteGroup[] {
	const rootPositions = getAllPositionsOfNote(state.root, state.fretRange);
	const groups: NoteGroup[] = state.activeCagedShapes.flatMap((shape) => {
		return rootPositions
			.map((rootPosition, index) => {
				const positions = collectWindowPositions(shape, rootPosition.fret, state.fretRange, notes);
				if (positions.length < 2) {
					return null;
				}

				return {
					id: `${shape}-${rootPosition.string}-${rootPosition.fret}-${index}`,
					positions,
					color: CAGED_COLORS[shape],
					strokeWidth: 3,
					fillOpacity: 0,
					label: `${shape}-shape`,
				};
			})
			.filter((group): group is NonNullable<typeof group> => group !== null);
	});

	return groups;
}

function collectWindowPositions(
	shape: ExplorerCagedShape,
	rootFret: number,
	fretRange: [number, number],
	notes: NoteName[],
) {
	const window = CAGED_WINDOWS[shape];
	const minFret = Math.max(fretRange[0], rootFret + window.startOffset);
	const maxFret = Math.min(fretRange[1], minFret + window.width - 1);

	if (minFret > maxFret) {
		return [];
	}

	const positions = notes.flatMap((note) =>
		getAllPositionsOfNote(note, [minFret, maxFret]).filter(
			(position) => position.fret >= minFret && position.fret <= maxFret,
		),
	);

	const seen = new Set<string>();
	return positions.filter((position) => {
		const key = `${position.string}:${position.fret}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

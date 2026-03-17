import { useCallback, useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button, ButtonGroup, Toggle } from "@/components/ui";
import { playFretPosition } from "@/lib/audio";
import {
	getConstructNotes,
	getDisplayNoteName,
	getFrequencyAtFret,
	getIntervalFormulaToken,
	getNoteAtFret,
} from "@/lib/music";
import type { AccidentalPreference, FretPosition, NoteName } from "@/types";
import {
	buildExplorerFretboardState,
	EXPLORER_CONSTRUCT_OPTIONS,
	type ExplorerCagedShape,
	type ExplorerConstructType,
	type ExplorerNoteFilter,
	type ExplorerState,
	getExplorerConstructFormula,
} from "./explorer";

const ROOT_OPTIONS: NoteName[] = [
	"C",
	"C#/Db",
	"D",
	"D#/Eb",
	"E",
	"F",
	"F#/Gb",
	"G",
	"G#/Ab",
	"A",
	"A#/Bb",
	"B",
];

const CONSTRUCT_TYPES: ExplorerConstructType[] = [
	"Scales",
	"Chords",
	"Arpeggios",
	"Single Intervals",
];
const CAGED_SHAPES: ExplorerCagedShape[] = ["C", "A", "G", "E", "D"];
const MAX_FRET = 15;

function getRangeProgress(value: number, min: number, max: number): string {
	return `${((value - min) / (max - min)) * 100}%`;
}

const INITIAL_STATE: ExplorerState = {
	root: "C",
	constructType: "Scales",
	constructName: "Major",
	labelType: "notes",
	noteFilter: "all",
	accidentalPreference: "sharp",
	fretRange: [1, 15],
	showCagedOverlay: false,
	activeCagedShapes: [...CAGED_SHAPES],
};

function toggleShape(shapes: ExplorerCagedShape[], shape: ExplorerCagedShape) {
	return shapes.includes(shape) ? shapes.filter((value) => value !== shape) : [...shapes, shape];
}

function InspectorBar({
	position,
	root,
	accidentalPreference,
	onPlay,
}: {
	position: FretPosition | null;
	root: NoteName;
	accidentalPreference: AccidentalPreference;
	onPlay: () => void;
}) {
	if (!position) {
		return (
			<div className="flex items-center gap-2 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-3 py-2 text-xs text-[var(--gb-text-muted)]">
				Hover a note to inspect
			</div>
		);
	}

	const note = getNoteAtFret(position);
	const noteLabel = getDisplayNoteName(note, accidentalPreference);
	const frequency = getFrequencyAtFret(position).toFixed(1);
	const rootLabel = getDisplayNoteName(root, accidentalPreference);
	const intervalFormula = getIntervalFormulaToken(root, note);

	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-3 py-2 text-xs shadow-[var(--gb-shadow-soft)]">
			<span>
				<span className="text-[var(--gb-text-muted)]">Pitch </span>
				<span className="font-semibold text-[var(--gb-text)]">{noteLabel}</span>
			</span>
			<span>
				<span className="text-[var(--gb-text-muted)]">Freq </span>
				<span className="font-semibold text-[var(--gb-text)]">{frequency} Hz</span>
			</span>
			<span>
				<span className="text-[var(--gb-text-muted)]">vs {rootLabel} </span>
				<span className="font-semibold text-[var(--gb-text)]">{intervalFormula}</span>
			</span>
			<button
				type="button"
				onClick={onPlay}
				className="ml-auto rounded-md border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-2 py-0.5 text-xs font-semibold text-[var(--gb-text)] transition-colors hover:bg-[var(--gb-bg-elev)]"
			>
				Play
			</button>
		</div>
	);
}

export function ExplorerPanel() {
	const [state, setState] = useState<ExplorerState>(INITIAL_STATE);
	const [hoveredPosition, setHoveredPosition] = useState<FretPosition | null>(null);

	const constructOptions = EXPLORER_CONSTRUCT_OPTIONS[state.constructType];
	const activeFormula = useMemo(() => getExplorerConstructFormula(state), [state]);
	const constructNoteNames = useMemo(
		() => Array.from(new Set(getConstructNotes(state.root, activeFormula))),
		[state.root, activeFormula],
	);
	const fretboardState = useMemo(() => buildExplorerFretboardState(state), [state]);
	const constructNotes = useMemo(() => activeFormula, [activeFormula]);
	const noteFilterOptions = useMemo(
		() => ["all", ...constructNoteNames] as ExplorerNoteFilter[],
		[constructNoteNames],
	);

	const rootLabel = getDisplayNoteName(state.root, state.accidentalPreference);

	useEffect(() => {
		if (state.noteFilter === "all") {
			return;
		}

		if (!constructNoteNames.includes(state.noteFilter)) {
			setState((current) => ({ ...current, noteFilter: "all" }));
		}
	}, [state.noteFilter, constructNoteNames]);

	const handlePlayHoveredNote = useCallback(() => {
		if (!hoveredPosition) {
			return;
		}

		void playFretPosition(hoveredPosition, "2n");
	}, [hoveredPosition]);

	return (
		<div className="space-y-4">
			{/* ── Fretboard hero ── */}
			<section className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-3 shadow-[var(--gb-shadow-soft)]">
				{/* Compact title bar */}
				<div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
					<h2 className="text-lg font-semibold text-[var(--gb-text)]">
						{rootLabel} {state.constructName}
					</h2>
					<span className="text-xs text-[var(--gb-text-muted)]">{constructNotes.join(" - ")}</span>
				</div>

				<div className="overflow-x-auto rounded-[14px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-2">
					<Fretboard
						mode="view"
						state={fretboardState}
						fretRange={state.fretRange}
						showNoteNames={state.labelType === "notes"}
						showIntervalLabels={state.labelType === "intervals"}
						playAudioOnFretClick
						ariaLabel="Fretboard explorer"
						onFretHoverChange={setHoveredPosition}
					/>
				</div>

				<div className="mt-2">
					<InspectorBar
						position={hoveredPosition}
						root={state.root}
						accidentalPreference={state.accidentalPreference}
						onPlay={handlePlayHoveredNote}
					/>
				</div>
			</section>

			{/* ── Controls ── */}
			<section className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)]">
				<div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
					<div className="rounded-[16px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4">
						<div className="mb-4 flex items-baseline justify-between gap-3">
							<div>
								<p className="gb-page-kicker mb-1">Theory</p>
								<h3 className="text-base font-semibold text-[var(--gb-text)]">
									Choose the sound set
								</h3>
							</div>
							<p className="text-xs text-[var(--gb-text-muted)]">Root, spelling, and formula</p>
						</div>

						<div className="space-y-3">
							<ButtonGroup
								options={ROOT_OPTIONS.map((note) => ({
									label: getDisplayNoteName(note, state.accidentalPreference),
									value: note,
								}))}
								value={state.root}
								onChange={(value) =>
									setState((current) => ({ ...current, root: value as NoteName }))
								}
								label="Root note"
							/>

							<ButtonGroup
								options={[
									{ label: "Sharps", value: "sharp" },
									{ label: "Flats", value: "flat" },
								]}
								value={state.accidentalPreference}
								onChange={(value) =>
									setState((current) => ({ ...current, accidentalPreference: value }))
								}
								label="Accidentals"
							/>

							<ButtonGroup
								options={CONSTRUCT_TYPES.map((type) => ({
									label: type,
									value: type,
								}))}
								value={state.constructType}
								onChange={(value) =>
									setState((current) => ({
										...current,
										constructType: value as ExplorerConstructType,
										constructName: EXPLORER_CONSTRUCT_OPTIONS[value as ExplorerConstructType][0],
									}))
								}
								label="Construct type"
							/>

							<div>
								<span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
									Specific construct
								</span>
								<select
									value={state.constructName}
									onChange={(e) =>
										setState((current) => ({ ...current, constructName: e.target.value }))
									}
									className="h-8 w-full rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-3 text-sm font-semibold text-[var(--gb-text)] outline-none transition-all focus:border-[var(--gb-accent)] focus:ring-2 focus:ring-[var(--gb-accent)] focus:ring-offset-1 focus:ring-offset-[var(--gb-bg-elev)]"
								>
									{constructOptions.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					<div className="rounded-[16px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4">
						<div className="mb-4 flex items-baseline justify-between gap-3">
							<div>
								<p className="gb-page-kicker mb-1">View</p>
								<h3 className="text-base font-semibold text-[var(--gb-text)]">
									Focus what you see
								</h3>
							</div>
							<p className="text-xs text-[var(--gb-text-muted)]">Labels, filters, and windows</p>
						</div>

						<div className="space-y-3">
							<ButtonGroup
								options={[
									{ label: "Note Names", value: "notes" },
									{ label: "Intervals", value: "intervals" },
								]}
								value={state.labelType}
								onChange={(value) => setState((current) => ({ ...current, labelType: value }))}
								label="Label type"
							/>

							<ButtonGroup
								options={[
									{ label: "All", value: "all" },
									...noteFilterOptions
										.filter((option) => option !== "all")
										.map((option) => ({
											label: getDisplayNoteName(option, state.accidentalPreference),
											value: option,
										})),
								]}
								value={state.noteFilter}
								onChange={(value) =>
									setState((current) => ({
										...current,
										noteFilter: value as ExplorerNoteFilter,
									}))
								}
								label="Filter by note"
							/>

							<div>
								<span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
									Fret window
								</span>
								<div className="grid grid-cols-2 gap-3 rounded-[14px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-3">
									<label className="text-xs text-[var(--gb-text-muted)]">
										Start
										<input
											type="range"
											min={1}
											max={MAX_FRET - 1}
											value={state.fretRange[0]}
											style={
												{
													"--range-progress": getRangeProgress(state.fretRange[0], 1, MAX_FRET - 1),
												} as React.CSSProperties
											}
											onChange={(event) => {
												const nextMin = Number(event.target.value);
												setState((current) => ({
													...current,
													fretRange: [
														Math.min(nextMin, current.fretRange[1] - 1),
														current.fretRange[1],
													],
												}));
											}}
											className="mt-1 w-full"
										/>
										<span className="block font-semibold text-[var(--gb-text)]">
											{state.fretRange[0]}
										</span>
									</label>
									<label className="text-xs text-[var(--gb-text-muted)]">
										End
										<input
											type="range"
											min={2}
											max={MAX_FRET}
											value={state.fretRange[1]}
											style={
												{
													"--range-progress": getRangeProgress(state.fretRange[1], 2, MAX_FRET),
												} as React.CSSProperties
											}
											onChange={(event) => {
												const nextMax = Number(event.target.value);
												setState((current) => ({
													...current,
													fretRange: [
														current.fretRange[0],
														Math.max(nextMax, current.fretRange[0] + 1),
													],
												}));
											}}
											className="mt-1 w-full"
										/>
										<span className="block font-semibold text-[var(--gb-text)]">
											{state.fretRange[1]}
										</span>
									</label>
								</div>
							</div>

							<div className="rounded-[14px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-3">
								<div className="flex items-center justify-between gap-3">
									<div>
										<span className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
											CAGED overlays
										</span>
										<p className="mt-1 text-xs text-[var(--gb-text-muted)]">
											Compare overlapping shape zones
										</p>
									</div>
									<Toggle
										checked={state.showCagedOverlay}
										onChange={(checked) =>
											setState((current) => ({ ...current, showCagedOverlay: checked }))
										}
									/>
								</div>
								{state.showCagedOverlay && (
									<div className="mt-3 flex flex-wrap gap-1.5">
										{CAGED_SHAPES.map((shape) => (
											<Button
												key={shape}
												variant={state.activeCagedShapes.includes(shape) ? "primary" : "secondary"}
												size="sm"
												onClick={() =>
													setState((current) => ({
														...current,
														activeCagedShapes: toggleShape(current.activeCagedShapes, shape),
													}))
												}
											>
												{shape}
											</Button>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
